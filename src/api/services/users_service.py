import uuid

from api.repositories.user_repository import UserRepository
from api.services.shelters_service import create_shelter
from flask_bcrypt import generate_password_hash
from flask_bcrypt import check_password_hash
from api.utils import APIException
from flask_jwt_extended import create_access_token, get_jwt_identity
from api.services.geolocation_service import locate_address

# campos que el usuario puede cambiar desde su perfil (rol, shelter_id o ranking nunca)
EDITABLE_FIELDS = {"name", "last_name1", "last_name2", "phone", "email", "address"}
REQUIRED_FIELDS = {"name", "last_name1", "phone", "email"}

# funcion que usa el jwt de la peticion para recuperar el usuario, o falla si no lo encuentra;
# con @jwt_required(optional=True) (sin token) devuelve None en vez de petar
def get_current_user():
    current_user_id = get_jwt_identity()
    if not current_user_id:
        return None
    return get_user(current_user_id)


# busca un usuario por uuid
def find_user(user_id):
    return UserRepository.get_by_user_id(user_id)

# carga un usuario por uuid o falla si no encontrado
def get_user(user_id):
    user = UserRepository.get_by_user_id(user_id)
    if user is None:
        raise APIException("Usuario no encontrado", status_code=404)
    return user

# crear, con uuid opcional y password de entrada plana y hash en el servicio
def create_user(**data):
    password = data.pop("password")

    data["user_id"] = data.get("user_id") or str(uuid.uuid4())

    user = UserRepository.create(password=password, **data)
    set_password(user, password)

    return user


def update_user(user, **data):
    password = data.pop("password", None)

    for field, value in data.items():
        setattr(user, field, value)

    if password:
        set_password(user, password)

    return user


def set_password(user, password):
    user.password = generate_password_hash(password).decode('utf-8')
    return user


def check_password(user, password):
    return check_password_hash(user.password, password)


def authenticate_user(email, password):
    user = UserRepository.get_by_email(email)

    if not user or not check_password(user, password):
        raise APIException("Credenciales invalidas", status_code=401)

    return user


def generate_access_token(user):
    token_version = user.token_version or 0
    return create_access_token(
        identity=user.user_id,
        additional_claims={"token_version": token_version},
    )


def revoke_user_tokens(user):
    user.token_version = (user.token_version or 0) + 1
    return UserRepository.save(user)


def is_token_revoked(jwt_header, jwt_payload):
    user_id = jwt_payload.get("sub")
    token_version = jwt_payload.get("token_version", 0)

    user = UserRepository.get_by_user_id(user_id)
    if user is None:
        return True

    return (user.token_version or 0) != token_version


def list_users():
    return UserRepository.list_all()


PASSWORD_MIN_LENGTH = 8

def validate_password(password):
    if len(password or "") < PASSWORD_MIN_LENGTH:
        raise APIException(
            f"La contraseña debe tener al menos {PASSWORD_MIN_LENGTH} caracteres",
            status_code=400
        )


def register_user(shelter_data=None, **data):
    validate_password(data.get("password"))

    if UserRepository.get_by_email(data["email"]):
        raise APIException("Ya existe una cuenta con ese correo", status_code=409)

    shelter = None

    if shelter_data:
        shelter = create_shelter(**shelter_data)
        data["rol"] = "shelter_admin"
    else:
        data["rol"] = "volunteer"

    user = create_user(**data)

    if shelter:
        user.shelter = shelter

    return UserRepository.save(user)

# actualiza los datos personales del usuario logueado;
def update_user_profile(user, **data):
    cambios = {campo: valor for campo, valor in data.items() if campo in EDITABLE_FIELDS}

    for campo in REQUIRED_FIELDS & cambios.keys():
        if not str(cambios[campo] or "").strip():
            raise APIException(f"El campo {campo} es obligatorio", status_code=400)

    nuevo_email = cambios.get("email")
    if nuevo_email and nuevo_email != user.email and UserRepository.get_by_email(nuevo_email):
        raise APIException("Ya existe una cuenta con ese correo", status_code=409)

    if "address" in cambios and cambios["address"] != user.address:
        try:
            cambios["map_positioning"] = locate_address(cambios["address"]).get("map_positioning")
        except APIException as error:
            if error.status_code == 404:
                cambios["map_positioning"] = None  # si no localiza la direccion vacia lo que haya
        except Exception:
            pass  # peta el apino tocamos map_positioning

    for campo, valor in cambios.items():
        setattr(user, campo, valor)

    return UserRepository.save(user)
