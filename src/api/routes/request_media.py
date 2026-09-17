import os

from flask import jsonify, request, send_from_directory
from flask_jwt_extended import jwt_required

from api.services.request_media_service import (
    UPLOAD_ROOT,
    add_necesidad_media,
    delete_necesidad_media,
    set_necesidad_media_cover,
)
from api.utils import APIException

from . import api
from .auth import get_current_user


def _require_shelter_user():
    user = get_current_user()
    if not user.shelter_id:
        raise APIException("El usuario no pertenece a ninguna protectora", status_code=403)
    return user


# ######################
#ruta para servir los archivos multimedia
# ######################
@api.route('/uploads/requests/<request_id>/<filename>', methods=['GET'])
def serve_necesidad_media(request_id, filename):
    directory = os.path.realpath(os.path.join(UPLOAD_ROOT, request_id))
    if not directory.startswith(os.path.realpath(UPLOAD_ROOT) + os.sep):
        raise APIException("Recurso no encontrado", status_code=404)
    return send_from_directory(directory, filename)


# ######################
# ruta para subir una foto o video a una necesidad (solo su protectora)
# ######################
@api.route('/shelter/requests/<request_id>/media', methods=['POST'])
@jwt_required()
def add_necesidad_media_action(request_id):
    user = _require_shelter_user()

    file = request.files.get('file')
    is_cover = request.form.get('is_cover', 'false').lower() == 'true'

    media = add_necesidad_media(request_id, user.shelter_id, file, is_cover=is_cover)
    return jsonify(media.serialize()), 201


# ######################
# ruta para eliminar una foto o video de una necesidad
# ######################
@api.route('/shelter/requests/<request_id>/media/<media_id>', methods=['DELETE'])
@jwt_required()
def delete_necesidad_media_action(request_id, media_id):
    user = _require_shelter_user()
    delete_necesidad_media(request_id, media_id, user.shelter_id)
    return jsonify({"success": True}), 200


# ######################
# ruta para marcar una foto o video ya subido como portada
# ######################
@api.route('/shelter/requests/<request_id>/media/<media_id>/cover', methods=['POST'])
@jwt_required()
def set_necesidad_media_cover_action(request_id, media_id):
    user = _require_shelter_user()
    media = set_necesidad_media_cover(request_id, media_id, user.shelter_id)
    return jsonify(media.serialize()), 200
