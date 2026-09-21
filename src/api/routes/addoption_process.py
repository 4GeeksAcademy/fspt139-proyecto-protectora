from flask import jsonify, request
from flask_jwt_extended import jwt_required

from api.services.addoption_process_service import (
    delete_addoption_process,
    get_addoption_process_by_animal,
    get_public_addoption_process,
    get_shelter_addoption_process,
    list_shelter_addoption_processes,
    open_addoption_process,
    serialize_public_addoption_process,
    serialize_shelter_addoption_process,
    set_addoption_process_status,
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
# ruta publica para consultar el proceso de adopcion (si existe) de un animal, con si admite
# solicitudes ahora mismo (is_open_for_requests): la ficha del animal la usa para decidir si
# muestra el boton "Solicitar adopción" y para pintar las preguntas del formulario
# ######################
@api.route('/animals/<animal_id>/addoption-process', methods=['GET'])
def get_public_addoption_process_action(animal_id):
    process = get_public_addoption_process(animal_id)
    return jsonify(serialize_public_addoption_process(process) if process else None), 200


# ######################
# ruta para consultar el proceso de adopcion (si existe) de un animal propio de la protectora
# ######################
@api.route('/shelter/animals/<animal_id>/addoption-process', methods=['GET'])
@jwt_required()
def get_addoption_process_action(animal_id):
    user = _require_shelter_user()
    process = get_addoption_process_by_animal(animal_id, user.shelter_id)
    return jsonify(process.serialize() if process else None), 200


# ######################
# ruta para el panel /panel/adopciones: todos los procesos de adopcion de la protectora (uno
# por animal), con recuento de solicitudes y fecha de la ultima, para armar el listado
# ######################
@api.route('/shelter/addoption-processes', methods=['GET'])
@jwt_required()
def list_shelter_addoption_processes_action():
    user = _require_shelter_user()

    filters = {
        "status": request.args.get("status"),
        "search": request.args.get("search"),
        "has_pending": request.args.get("has_pending", "false").lower() == "true",
    }
    order = request.args.get('dir', 'desc').lower()
    page, per_page = paginate_args()

    resultados = list_shelter_addoption_processes(
        user.shelter_id, filters=filters, dir=order, page=page, per_page=per_page)

    response_body = {
        "items": [serialize_shelter_addoption_process(process) for process in resultados.items],
        "page": resultados.page,
        "per_page": resultados.per_page,
        "total_items": resultados.total,
        "total_pages": resultados.pages,
    }

    return jsonify(response_body), 200


# ######################
# ruta para la cabecera de la vista de un proceso concreto (por su addoption_process_id publico)
# ######################
@api.route('/shelter/addoption-processes/<addoption_process_id>', methods=['GET'])
@jwt_required()
def get_shelter_addoption_process_action(addoption_process_id):
    user = _require_shelter_user()
    process = get_shelter_addoption_process(addoption_process_id, user.shelter_id)
    return jsonify(serialize_shelter_addoption_process(process)), 200


# ######################
# ruta para abrir (o reconfigurar) el proceso de adopcion de un animal propio de la protectora
# ######################
@api.route('/shelter/animals/<animal_id>/addoption-process', methods=['POST'])
@jwt_required()
def open_addoption_process_action(animal_id):
    user = _require_shelter_user()
    data = request.get_json() or {}

    process = open_addoption_process(
        animal_id,
        user.shelter_id,
        concurrent_requests_limit=data.get("concurrent_requests_limit"),
        contribution_amount=data.get("contribution_amount"),
        start_date=data.get("start_date"),
        end_date=data.get("end_date"),
        requirements=data.get("requirements"),
        questions=data.get("questions"),
    )
    return jsonify(process.serialize()), 201


# ######################
# ruta para cerrar/reabrir manualmente un proceso desde el panel, sin tocar el resto de su
# configuracion (fechas, limite, requisitos, preguntas)
# ######################
@api.route('/shelter/addoption-processes/<addoption_process_id>/status', methods=['PATCH'])
@jwt_required()
def set_addoption_process_status_action(addoption_process_id):
    user = _require_shelter_user()
    data = request.get_json() or {}

    process = set_addoption_process_status(addoption_process_id, user.shelter_id, data.get("status"))
    return jsonify(serialize_shelter_addoption_process(process)), 200


# ######################
# ruta para eliminar un proceso propio de la protectora, solo si todavia no tiene solicitudes
# ######################
@api.route('/shelter/addoption-processes/<addoption_process_id>', methods=['DELETE'])
@jwt_required()
def delete_addoption_process_action(addoption_process_id):
    user = _require_shelter_user()
    delete_addoption_process(addoption_process_id, user.shelter_id)
    return jsonify({"success": True}), 200
