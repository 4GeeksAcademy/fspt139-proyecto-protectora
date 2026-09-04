from flask import request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from api.services.auth_service import authenticate_user
from . import api
from api.repositories.user_repository import UserRepository

@api.route('/login', methods=['POST'])
def login_action():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email y contraseña son obligatorios"}), 400 

    user = authenticate_user(email, password)

    if user is None:
        return jsonify({"error": "Credenciales invalidas"}), 401

    access_token = create_access_token(identity=user.user_id)

    return jsonify({"token": access_token}), 200


@api.route('/profile', methods=['GET'])
@jwt_required()
def profile_action():
    current_user_id = get_jwt_identity()
    user = UserRepository.get_by_user_id(current_user_id)

    if user is None:
        return jsonify({"error": "Credenciales invalidas"}), 404

    return jsonify(user.serialize()), 200