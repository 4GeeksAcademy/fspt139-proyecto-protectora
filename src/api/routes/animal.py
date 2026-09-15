from flask import jsonify, request
from flask_jwt_extended import jwt_required

from api.repositories.animal_repository import FILTERABLE_FIELDS
from api.services.animals_service import get_animal, get_shelter_animal, list_animals, upsert_animal
from api.utils import APIException, paginate_args
from .auth import get_current_user

from . import api

# ####################### ####################### ######################
# RUTAS PUBLICAS: FILTRADAS TODAS POR STATUS
# ####################### ####################### ######################


# ######################
#ruta para listar los animales publicados visibles a los usuarios
# ######################
@api.route('/animals', methods=['GET'])
@jwt_required()
def list_animals_action():

    filters = {field: value for field in FILTERABLE_FIELDS if (value := request.args.get(field))}
    filters['status'] = 'disponible'  # fuerza el status: ignora cualquier status recibido por query
    sort_by = request.args.get('sort_by')
    order = request.args.get('dir', 'asc').lower()
    page, per_page = paginate_args()

    resultados = list_animals(filters=filters, sort_by=sort_by, dir=order, page=page, per_page=per_page)

    response_body = {
        "items": [animal.serialize() for animal in resultados.items],
        "page": resultados.page,
        "per_page": resultados.per_page,
        "total_items": resultados.total,
        "total_pages": resultados.pages,
    }

    return jsonify(response_body), 200

# ######################
#ruta para ver un animal concreto (version publica): solo si esta disponible, si no 404
# ######################
@api.route('/animals/<animal_id>', methods=['GET'])
def get_animal_action(animal_id):
    animal = get_animal(animal_id)
    return jsonify(animal.serialize()), 200






# ####################### ####################### ######################
# RUTAS PROTEGIDAS: FILTRADAS POR ROL
# ####################### ####################### ######################


# ######################
#ruta para listar unicamente los animales de la protectora del usuario logueado
# ######################
@api.route('/shelter/animals', methods=['GET'])
@jwt_required()
def list_shelter_animals_action():
    user = get_current_user()
    if not user.shelter_id:
        raise APIException("El usuario no pertenece a ninguna protectora", status_code=403)

    filters = {field: value for field in FILTERABLE_FIELDS if (value := request.args.get(field))}
    filters['shelter_id'] = user.shelter_id  # fuerza la protectoa, ignora cualquier shelter_id recibido por query
    sort_by = request.args.get('sort_by')
    order = request.args.get('dir', 'asc').lower()
    page, per_page = paginate_args()

    resultados = list_animals(filters=filters, sort_by=sort_by, dir=order, page=page, per_page=per_page)

    response_body = {
        "items": [animal.serialize() for animal in resultados.items],
        "page": resultados.page,
        "per_page": resultados.per_page,
        "total_items": resultados.total,
        "total_pages": resultados.pages,
    }

    return jsonify(response_body), 200


# ######################
#ruta para obtener un animal concreto de la protectora del usuario logueado (para el formulario de edición)
# ######################
@api.route('/shelter/animals/<animal_id>', methods=['GET'])
@jwt_required()
def get_shelter_animal_action(animal_id):
    user = get_current_user()
    if not user.shelter_id:
        raise APIException("El usuario no pertenece a ninguna protectora", status_code=403)

    animal = get_shelter_animal(animal_id, user.shelter_id)
    return jsonify(animal.serialize()), 200




# ######################
#ruta para modificaciones sobre animal dado un animal_id desde protectora
# ######################
@api.route('/shelter/animals/<animal_id>', methods=['PUT'])
@jwt_required()
def upsert_animal_action(animal_id):
    user = get_current_user()
    if not user.shelter_id:
        raise APIException("El usuario no pertenece a ninguna protectora", status_code=403)

    data = request.get_json() or {}
    data.pop("animal_id", None) # prevenimos si se añadió a los campos la modificacion de id

    try:
        animal, created = upsert_animal(animal_id, shelter_id=user.shelter_id, **data)
        response = jsonify(animal.serialize())
        response.status_code = 201 if created else 200
        response.headers['Location'] = f"/panel/animales"

        return response
    except APIException:
        raise
    except Exception:
        return jsonify({"error": "Ha ocurrido un error inesperado"}), 500
