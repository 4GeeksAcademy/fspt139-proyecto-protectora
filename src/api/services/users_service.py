from api.repositories.user_repository import UserRepository
from flask_bcrypt import generate_password_hash
from flask_bcrypt import check_password_hash


def set_password(user,password):
    user.password = generate_password_hash(password).decode('utf-8')
    return user

def check_password(user, password):
    return check_password_hash(user.password,password)

def list_users():
    return UserRepository.list_all()
