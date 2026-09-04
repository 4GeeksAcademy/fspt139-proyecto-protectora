import uuid

from api.repositories.user_repository import UserRepository
from flask_bcrypt import generate_password_hash
from flask_bcrypt import check_password_hash
from flask_jwt_extended import create_access_token
from api.utils import APIException

# busca un usuario por uuid
def find_user(user_id):
    return UserRepository.get_by_user_id(user_id)
# carga un usuario por uuid o falla si no encontrado
def get_user(user_id):
    user = UserRepository.get_by_user_id(user_id)
    if user is None:
        raise APIException("Usuario no encontrado", status_code=404)
    return user

#crear, con uuid opcional y password de entrada plana y hash en el servicio
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

def set_password(user,password):
    user.password = generate_password_hash(password).decode('utf-8')
    return user

def check_password(user, password):
    return check_password_hash(user.password,password)

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