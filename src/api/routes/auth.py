from flask import request, jsonify
from flask_jwt_extended import jwt_required
from api.services.users_service import (
    authenticate_user, generate_access_token, get_current_user, get_user,
    revoke_user_tokens, update_user_profile,
)
from api.utils import APIException
from . import api


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


