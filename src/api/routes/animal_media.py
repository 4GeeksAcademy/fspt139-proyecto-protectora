from flask import jsonify, request
from flask_jwt_extended import jwt_required

from api.services.animal_media_service import (
    add_animal_media,
    delete_animal_media,
    set_animal_media_cover,
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
#ruta para subir una foto o video a la ficha de un animal (solo su protectora)
# ######################
@api.route('/shelter/animals/<animal_id>/media', methods=['POST'])
@jwt_required()
def add_animal_media_action(animal_id):
    user = _require_shelter_user()

    file = request.files.get('file')
    is_cover = request.form.get('is_cover', 'false').lower() == 'true'

    media = add_animal_media(animal_id, user.shelter_id, file, is_cover=is_cover)
    return jsonify(media.serialize()), 201


# ######################
#ruta para eliminar una foto o video de la ficha de un animal
# ######################
@api.route('/shelter/animals/<animal_id>/media/<media_id>', methods=['DELETE'])
@jwt_required()
def delete_animal_media_action(animal_id, media_id):
    user = _require_shelter_user()
    delete_animal_media(animal_id, media_id, user.shelter_id)
    return jsonify({"success": True}), 200


# ######################
#ruta para marcar una foto o video ya subido como portada
# ######################
@api.route('/shelter/animals/<animal_id>/media/<media_id>/cover', methods=['POST'])
@jwt_required()
def set_animal_media_cover_action(animal_id, media_id):
    user = _require_shelter_user()
    media = set_animal_media_cover(animal_id, media_id, user.shelter_id)
    return jsonify(media.serialize()), 200
