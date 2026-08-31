

from api.repositories.user_repository import UserRepository
from flask_bcrypt import generate_password_hash
from flask_bcrypt import check_password_hash


def set_password(User,password):
    User.password = generate_password_hash(password).decode('utf-8')
    return User

def check_password(User, password):
    return check_password_hash(User.password,password)

def list_users():
    return UserRepository.list_all()
