from flask import jsonify, request
from flask_jwt_extended import jwt_required

from api.services.addoption_request_service import (
    accept_addoption_request,
    create_addoption_request,
    discard_addoption_requests,
    get_shelter_addoption_request,
    list_shelter_addoption_requests,
    serialize_addoption_request_for_shelter,
)
from api.utils import APIException, paginate_args

from . import api
from .auth import get_current_user


def _require_shelter_user():
    user = get_current_user()
    if not user.shelter_id:
        raise APIException("El usuario no pertenece a ninguna protectora", status_code=403)
    return user


# ######################
# ruta para que un usuario logueado envie una solicitud de adopcion de un animal, contestando a
# las preguntas del proceso vigente; si con esta solicitud se alcanza el limite de solicitudes
# simultaneas del proceso, este se cierra automaticamente
# ######################
@api.route('/animals/<animal_id>/addoption-requests', methods=['POST'])
@jwt_required()
def create_addoption_request_action(animal_id):
    user = get_current_user()
    data = request.get_json() or {}

    addoption_request = create_addoption_request(animal_id, user, answers=data.get("answers"))
    return jsonify(addoption_request.serialize()), 201


# ######################
# ruta para listar (paginado, filtrable por estado y por nombre/email del solicitante) las
# solicitudes de un proceso propio de la protectora
# ######################
@api.route('/shelter/addoption-processes/<addoption_process_id>/addoption-requests', methods=['GET'])
@jwt_required()
def list_shelter_addoption_requests_action(addoption_process_id):
    user = _require_shelter_user()

    filters = {
        "status": request.args.get("status"),
        "search": request.args.get("search"),
    }
    order = request.args.get('dir', 'desc').lower()
    page, per_page = paginate_args()

    resultados = list_shelter_addoption_requests(
        addoption_process_id, user.shelter_id, filters=filters, dir=order, page=page, per_page=per_page)

    response_body = {
        "items": [serialize_addoption_request_for_shelter(r) for r in resultados.items],
        "page": resultados.page,
        "per_page": resultados.per_page,
        "total_items": resultados.total,
        "total_pages": resultados.pages,
    }

    return jsonify(response_body), 200


# ######################
# ruta para ver el detalle de una solicitud propia de la protectora: respuestas + datos del
# usuario que solicita la adopcion
# ######################
@api.route('/shelter/addoption-requests/<addoption_request_id>', methods=['GET'])
@jwt_required()
def get_shelter_addoption_request_action(addoption_request_id):
    user = _require_shelter_user()
    addoption_request = get_shelter_addoption_request(addoption_request_id, user.shelter_id)
    return jsonify(serialize_addoption_request_for_shelter(addoption_request)), 200


# ######################
# ruta para aprobar una solicitud: accion individual (nunca en bloque), mediante boton propio
# ######################
@api.route('/shelter/addoption-requests/<addoption_request_id>/accept', methods=['POST'])
@jwt_required()
def accept_addoption_request_action(addoption_request_id):
    user = _require_shelter_user()
    addoption_request = accept_addoption_request(addoption_request_id, user.shelter_id)
    return jsonify(serialize_addoption_request_for_shelter(addoption_request)), 200


# ######################
# ruta para descartar solicitudes en bloque (seleccion multiple tipo Gmail)
# ######################
@api.route('/shelter/addoption-requests/discard', methods=['POST'])
@jwt_required()
def discard_addoption_requests_action():
    user = _require_shelter_user()
    data = request.get_json() or {}

    discarded = discard_addoption_requests(data.get("addoption_request_ids"), user.shelter_id)
    return jsonify({"discarded": [serialize_addoption_request_for_shelter(r) for r in discarded]}), 200
