from flask import request, jsonify
from flask_jwt_extended import jwt_required
from api.services.users_service import (
    authenticate_user, generate_access_token, get_current_user, get_user,
    revoke_user_tokens, update_user_profile,
)
from api.utils import APIException
from . import api


@api.route('/profile', methods=['GET'])
@jwt_required()
def profile_action():
    user = get_current_user()
    return jsonify(user.serialize()), 200



@api.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile_action():
    user = get_current_user()
    data = request.get_json() or {}
    user = update_user_profile(user, **data)
    return jsonify(user.serialize()), 200