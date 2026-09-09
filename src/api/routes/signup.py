from flask import request, jsonify

from api.services.users_service import register_user
from api.utils import APIException

from . import api


USER_REQUIRED = ["name", "last_name1", "email", "phone", "password"]
SHELTER_REQUIRED = ["shelter_name", "shelter_address", "shelter_phone"]


def get_signup_data():
    data = request.get_json()

    if not all(data.get(campo) for campo in USER_REQUIRED):
        raise APIException("Faltan campos obligatorios", status_code=400)

    user_data = {
        "name": data.get("name"),
        "last_name1": data.get("last_name1"),
        "last_name2": data.get("last_name2"),
        "email": data.get("email"),
        "phone": data.get("phone"),
        "password": data.get("password"),
    }

    if not data.get("shelter_name"):
        return user_data, None

    if not all(data.get(campo) for campo in SHELTER_REQUIRED):
        raise APIException("Faltan datos de la protectora", status_code=400)

    shelter_data = {
        "name": data.get("shelter_name"),
        "address": data.get("shelter_address"),
        "phone": data.get("shelter_phone"),
    }

    return user_data, shelter_data


@api.route('/signup', methods=['POST'])
def signup_action():

    user_data, shelter_data = get_signup_data()

    try:
        user = register_user(shelter_data=shelter_data, **user_data)

        return jsonify({"user": user.serialize()}), 201

    except APIException:

        raise

    except Exception:

        return jsonify({"error": "Ha ocurrido un error inesperado"}), 500
