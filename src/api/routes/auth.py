from flask import request, jsonify
from flask_jwt_extended import create_access_token
from api.services.auth_service import authenticate_user
from . import api

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