from flask import jsonify, request
from flask_jwt_extended import jwt_required

from api.repositories.request_repository import FILTERABLE_FIELDS
from api.services.requests_service import crear_necesidad, list_requests, obtener_necesidad_shelter
from api.utils import APIException, paginate_args
from .auth import get_current_user

from . import api


@api.route('/requests', methods=['GET'])
def list_requests_action():

    filters = {field: value for field in FILTERABLE_FIELDS if (value := request.args.get(field))}
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
        response.headers['Location'] = f"/panel/necesidades"

        return response
    except APIException:
        raise
    except Exception:
        return jsonify({"error": "Ha ocurrido un error inesperado"}), 500
