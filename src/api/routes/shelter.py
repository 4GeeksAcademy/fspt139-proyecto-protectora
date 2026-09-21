from flask import jsonify, request
from flask_jwt_extended import jwt_required

from api.repositories.shelter_repository import FILTERABLE_FIELDS
from api.services.shelters_service import (
    get_shelter, list_shelters, serialize_shelter_detail, shelter_metrics, update_shelter_profile,
)
from api.utils import APIException, paginate_args
from .auth import get_current_user

from . import api


@api.route('/shelters', methods=['GET'])
def list_shelters_action():

    filters = {field: value for field in FILTERABLE_FIELDS if (value := request.args.get(field))}
    sort_by = request.args.get('sort_by')
    order = request.args.get('dir', 'asc').lower()
    has_urgent = request.args.get('has_urgent') == 'true'
    has_animals = request.args.get('has_animals') == 'true'
    page, per_page = paginate_args()

    resultados = list_shelters(
        filters=filters, sort_by=sort_by, dir=order, page=page, per_page=per_page,
        has_urgent=has_urgent, has_animals=has_animals,
    )

    response_body = {
        "items": [
            {**shelter.serialize(), **shelter_metrics(shelter)}
            for shelter in resultados.items],
        "page": resultados.page,
        "per_page": resultados.per_page,
        "total_items": resultados.total,
        "total_pages": resultados.pages,
    }

    return jsonify(response_body), 200


@api.route('/shelters/<shelter_id>', methods=['GET'])
def get_shelter_action(shelter_id):
    shelter = get_shelter(shelter_id)
    return jsonify(serialize_shelter_detail(shelter)), 200


# ####################### ####################### ######################
# RUTAS PROTEGIDAS: PERFIL DE LA PROTECTORA DEL USUARIO LOGUEADO
# ####################### ####################### ######################

def _usuario_de_protectora():
    user = get_current_user()
    if not user.shelter_id:
        raise APIException("El usuario no pertenece a ninguna protectora", status_code=403)
    return user


@api.route('/shelter/profile', methods=['GET'])
@jwt_required()
def get_shelter_profile_action():
    user = _usuario_de_protectora()
    return jsonify(serialize_shelter_detail(user.shelter)), 200


@api.route('/shelter/profile', methods=['PUT'])
@jwt_required()
def update_shelter_profile_action():
    user = _usuario_de_protectora()
    data = request.get_json() or {}
    shelter = update_shelter_profile(user.shelter_id, **data)
    return jsonify(serialize_shelter_detail(shelter)), 200