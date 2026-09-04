from api.repositories.user_repository import UserRepository
from api.services.users_service import check_password

def authenticate_user(email, password):
    user = UserRepository.get_by_email(email)
    if user is None:
        return None

    if not check_password(user, password):
        return None

    return user