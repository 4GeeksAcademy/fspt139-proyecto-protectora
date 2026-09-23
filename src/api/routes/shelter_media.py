import os

from flask import jsonify, request, send_from_directory
from flask_jwt_extended import jwt_required

from api.services.shelter_media_service import (
    UPLOAD_ROOT,
    add_shelter_logo,
    delete_shelter_logo,
)
from api.services.shelters_service import serialize_shelter_detail
from api.utils import APIException

from . import api
from .auth import get_current_user


def _require_shelter_user():
    user = get_current_user()
    if not user.shelter_id:
        raise APIException("El usuario no pertenece a ninguna protectora", status_code=403)
    return user


# ######################
# ruta para servir el logo subido por la protectora
# ######################
@api.route('/uploads/shelters/<shelter_id>/<filename>', methods=['GET'])
def serve_shelter_logo(shelter_id, filename):
    directory = os.path.realpath(os.path.join(UPLOAD_ROOT, shelter_id))
    if not directory.startswith(os.path.realpath(UPLOAD_ROOT) + os.sep):
        raise APIException("Recurso no encontrado", status_code=404)
    return send_from_directory(directory, filename)


# ######################
# ruta para subir/reemplazar el logo de la protectora del usuario logueado
# ######################
@api.route('/shelter/logo', methods=['POST'])
@jwt_required()
def add_shelter_logo_action():
    user = _require_shelter_user()

    file = request.files.get('file')
    shelter = add_shelter_logo(user.shelter_id, file)
    return jsonify(serialize_shelter_detail(shelter)), 201


# ######################
# ruta para quitar el logo de la protectora del usuario logueado
# ######################
@api.route('/shelter/logo', methods=['DELETE'])
@jwt_required()
def delete_shelter_logo_action():
    user = _require_shelter_user()
    shelter = delete_shelter_logo(user.shelter_id)
    return jsonify(serialize_shelter_detail(shelter)), 200
