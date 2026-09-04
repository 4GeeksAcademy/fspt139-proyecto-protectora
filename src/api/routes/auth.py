from flask import request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from api.services.auth_service import authenticate_user
from api.utils import APIException
from . import api
from api.repositories.user_repository import UserRepository

@api.route('/login', methods=['POST'])
def login_action():

    data = request.get_json()
    usuario = data.get("usuario")
    password = data.get("password")

    if not usuario or not password:
        return jsonify({"error": "Email y contraseña son obligatorios"}), 400

    try:
        user = authenticate_user(usuario, password)
        access_token = create_access_token(identity=user.user_id)

        return jsonify({"token": access_token, "user": user.serialize()}), 200

    except APIException as e:

        return jsonify({"error": e.message}), e.status_code

    except Exception:

        return jsonify({"error": "Ha ocurrido un error inesperado"}), 500


@api.route('/logout', methods=['POST'])
@jwt_required()
def logout_action():
    current_user_id = get_jwt_identity()
    user = UserRepository.get_by_user_id(current_user_id)
#     todo: anular el token o registrar la accion de salida del usuario
# ... falta

    return jsonify(user.serialize()), 200



@api.route('/profile', methods=['GET'])
@jwt_required()
def profile_action():
    current_user_id = get_jwt_identity()
    user = UserRepository.get_by_user_id(current_user_id)

    if user is None:
        return jsonify({"error": "Usuario no encontrado"}), 404

    return jsonify(user.serialize()), 200