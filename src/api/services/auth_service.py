from api.repositories.user_repository import UserRepository
from api.services.users_service import check_password
from api.utils import APIException

def authenticate_user(email, password):
    user = UserRepository.get_by_email(email)

    if not user or not check_password(user, password):
        raise APIException("Credenciales invalidas", status_code=401)

    return user