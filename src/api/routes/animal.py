from flask import jsonify, request
from flask_jwt_extended import jwt_required

from api.repositories.animal_repository import FILTERABLE_FIELDS
from api.services.animals_service import list_animals

from . import api


@api.route('/animals', methods=['GET'])
@jwt_required()
def list_animals_action():

    DEFAULT_PAGE = 1
    DEFAULT_PER_PAGE = 10
    MAX_PER_PAGE = 100


    filters = {field: value for field in FILTERABLE_FIELDS if (value := request.args.get(field))}
    sort_by = request.args.get('sort_by')
    order = request.args.get('dir', 'asc').lower()

    try:
        page = int(request.args.get('page', DEFAULT_PAGE))
    except ValueError:
        page = DEFAULT_PAGE

    try:
        per_page = int(request.args.get('per_page', DEFAULT_PER_PAGE))
    except ValueError:
        per_page = DEFAULT_PER_PAGE

    page = max(page, 1)
    per_page = max(per_page, 1)

    per_page = min(per_page, MAX_PER_PAGE)

    resultados = list_animals(filters=filters, sort_by=sort_by, dir=order, page=page, per_page=per_page)

    response_body = {
        "items": [animal.serialize() for animal in resultados.items],
        "page": resultados.page,
        "per_page": resultados.per_page,
        "total_items": resultados.total,
        "total_pages": resultados.pages,
    }

    return jsonify(response_body), 200
