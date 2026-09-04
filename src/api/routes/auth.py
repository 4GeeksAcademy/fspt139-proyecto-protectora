from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from api.services.users_service import authenticate_user, generate_access_token, get_user, revoke_user_tokens
from api.utils import APIException
from . import api

# funcion que usa el jwt de la peticion para recuperar le usuario o petar
def get_current_user():
    current_user_id = get_jwt_identity()
    return get_user(current_user_id)


@api.route('/login', methods=['POST'])
def login_action():

    data = request.get_json()
    usuario = data.get("usuario")
    password = data.get("password")

    if not usuario or not password:
        return jsonify({"error": "Email y contraseña son obligatorios"}), 400

    try:
        user = authenticate_user(usuario, password)
        access_token = generate_access_token(user)

        return jsonify({"token": access_token, "user": user.serialize()}), 200

    except APIException:

        raise

    except Exception:

        return jsonify({"error": "Ha ocurrido un error inesperado"}), 500


@api.route('/logout', methods=['POST'])
@jwt_required()
def logout_action():
    user = get_current_user()
    revoke_user_tokens(user)

    return jsonify({"success": True}), 200


@api.route('/profile', methods=['GET'])
@jwt_required()
def profile_action():
    user = get_current_user()
    return jsonify(user.serialize()), 200