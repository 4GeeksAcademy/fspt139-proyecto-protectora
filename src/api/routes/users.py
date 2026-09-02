from flask import jsonify

from api.services.users_service import list_users

from . import api


@api.route('/users', methods=['GET'])
def list_user_action():


    users = list_users()       
    response_body = [user.serialize() for user in users]


    return jsonify(response_body), 200