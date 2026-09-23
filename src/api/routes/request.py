from flask import jsonify, request
from flask_jwt_extended import jwt_required

from api.repositories.request_repository import FILTERABLE_FIELDS
from api.services.requests_service import PUBLIC_STATUSES, get_request, crear_necesidad, list_requests, obtener_necesidad_shelter
from api.services.user_request_service import (
    answer_user_request,
    answer_user_requests_bulk,
    create_user_request,
    list_my_user_requests,
    list_shelter_user_requests,
    serialize_user_request_for_shelter,
    serialize_user_request_for_user,
)

from api.utils import APIException, paginate_args
from .auth import get_current_user

from . import api


def _require_shelter_user():
    user = get_current_user()
    if not user.shelter_id:
        raise APIException("El usuario no pertenece a ninguna protectora", status_code=403)
    return user


@api.route('/requests', methods=['GET'])
def list_requests_action():

    filters = {}
    for field in FILTERABLE_FIELDS:
        values = [value for value in request.args.getlist(field) if value]
        if not values:
            continue
        filters[field] = values if len(values) > 1 else values[0]

    status = request.args.get('status')
    filters['status'] = status if status in PUBLIC_STATUSES else PUBLIC_STATUSES
    sort_by = request.args.get('sort_by')
    order = request.args.get('dir', 'asc').lower()
    page, per_page = paginate_args()

    resultados = list_requests(filters=filters, sort_by=sort_by, dir=order, page=page, per_page=per_page)

    response_body = {
        "items": [req.serialize() for req in resultados.items],
        "page": resultados.page,
        "per_page": resultados.per_page,
        "total_items": resultados.total,
        "total_pages": resultados.pages,
    }

    return jsonify(response_body), 200

@api.route('/requests/<request_id>', methods=['GET'])
def get_request_action(request_id):
    necesidad = get_request(request_id)
    return jsonify(necesidad.serialize()), 200


# ####################### ####################### ######################
# RUTAS PROTEGIDAS: FILTRADAS POR ROL
# ####################### ####################### ######################


# ######################
# ruta para listar unicamente las necesidades de la protectora del usuario logueado
# ######################
@api.route('/shelter/requests', methods=['GET'])
@jwt_required()
def listar_necesidades_shelter_action():
    user = get_current_user()
    if not user.shelter_id:
        raise APIException("El usuario no pertenece a ninguna protectora", status_code=403)

    filters = {field: value for field in FILTERABLE_FIELDS if (value := request.args.get(field))}
    filters['shelter_id'] = user.shelter_id  # fuerza la protectora, ignora cualquier shelter_id recibido por query
    sort_by = request.args.get('sort_by')
    order = request.args.get('dir', 'asc').lower()
    page, per_page = paginate_args()

    resultados = list_requests(filters=filters, sort_by=sort_by, dir=order, page=page, per_page=per_page)

    response_body = {
        "items": [req.serialize() for req in resultados.items],
        "page": resultados.page,
        "per_page": resultados.per_page,
        "total_items": resultados.total,
        "total_pages": resultados.pages,
    }

    return jsonify(response_body), 200


# ######################
# ruta para obtener una necesidad concreta de la protectora del usuario logueado (para el formulario de edición)
# ######################
@api.route('/shelter/requests/<request_id>', methods=['GET'])
@jwt_required()
def obtener_necesidad_shelter_action(request_id):
    user = get_current_user()
    if not user.shelter_id:
        raise APIException("El usuario no pertenece a ninguna protectora", status_code=403)

    necesidad = obtener_necesidad_shelter(request_id, user.shelter_id)
    return jsonify(necesidad.serialize()), 200


# ######################
# ruta para crear o actualizar una necesidad dado un request_id desde protectora
# ######################
@api.route('/shelter/requests/<request_id>', methods=['PUT'])
@jwt_required()
def crear_necesidad_action(request_id):
    user = get_current_user()
    if not user.shelter_id:
        raise APIException("El usuario no pertenece a ninguna protectora", status_code=403)

    data = request.get_json() or {}
    data.pop("request_id", None)  # prevenimos si se añadió a los campos la modificacion de id

    try:
        necesidad, created = crear_necesidad(request_id, shelter_id=user.shelter_id, **data)
        response = jsonify(necesidad.serialize())
        response.status_code = 201 if created else 200
#         response.headers['Location'] = f"/panel/necesidades"
        response.headers['Location'] = f"/panel/necesidades/{necesidad.request_id}"

        return response
    except APIException:
        raise
    except Exception:
        return jsonify({"error": "Ha ocurrido un error inesperado"}), 500


# ######################
# ruta para que un usuario logueado colabore con una necesidad
# ######################
@api.route('/requests/<request_id>/user-requests', methods=['POST'])
@jwt_required()
def create_colaboracion_action(request_id):
    user = get_current_user()
    data = request.get_json() or {}

    user_request = create_user_request(request_id, user, amount=data.get("amount"), details=data.get("details"))
    return jsonify(user_request.serialize()), 201


# ######################
# ruta para listar (paginado) las contribuciones de una necesidad propia de la protectora
# ######################
@api.route('/shelter/requests/<request_id>/user-requests', methods=['GET'])
@jwt_required()
def list_shelter_user_requests_action(request_id):
    user = _require_shelter_user()
    page, per_page = paginate_args()

    resultados = list_shelter_user_requests(request_id, user.shelter_id, page=page, per_page=per_page)

    response_body = {
        "items": [serialize_user_request_for_shelter(r) for r in resultados.items],
        "page": resultados.page,
        "per_page": resultados.per_page,
        "total_items": resultados.total,
        "total_pages": resultados.pages,
    }

    return jsonify(response_body), 200


# ######################
# ruta para responder a una contribucion de una en una: escribe la respuesta de la protectora
# (shelter_answer) y, opcionalmente, deja una valoracion (UserReview) sobre quien ha colaborado
# ######################
@api.route('/shelter/user-requests/<user_request_id>/answer', methods=['POST'])
@jwt_required()
def answer_user_request_action(user_request_id):
    user = _require_shelter_user()
    data = request.get_json() or {}

    user_request = answer_user_request(
        user_request_id, user.shelter_id, data.get("shelter_answer"), review=data.get("review"))
    return jsonify(serialize_user_request_for_shelter(user_request)), 200


# ######################
# ruta para responder en bloque a varias contribuciones (seleccion multiple tipo Gmail), con el
# mismo mensaje para todas
# ######################
@api.route('/shelter/user-requests/answer', methods=['POST'])
@jwt_required()
def answer_user_requests_bulk_action():
    user = _require_shelter_user()
    data = request.get_json() or {}

    answered = answer_user_requests_bulk(
        data.get("user_request_ids"), user.shelter_id, data.get("shelter_answer"))
    return jsonify({"answered": [serialize_user_request_for_shelter(r) for r in answered]}), 200

# ######################
# ruta para listar (paginado) las colaboraciones del usuario logueado; con ?answered=true solo
# las que la protectora ya ha respondido
# ######################
@api.route('/user/user-requests', methods=['GET'])
@jwt_required()
def list_my_user_requests_action():
    user = get_current_user()
    answered = request.args.get("answered", "false").lower() == "true"
    page, per_page = paginate_args()

    resultados = list_my_user_requests(user.id, answered=answered, page=page, per_page=per_page)

    response_body = {
        "items": [serialize_user_request_for_user(r) for r in resultados.items],
        "page": resultados.page,
        "per_page": resultados.per_page,
        "total_items": resultados.total,
        "total_pages": resultados.pages,
    }

    return jsonify(response_body), 200