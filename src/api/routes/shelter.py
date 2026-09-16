from flask import jsonify, request

from api.repositories.shelter_repository import FILTERABLE_FIELDS
from api.services.shelters_service import list_shelters
from api.utils import paginate_args

from . import api


@api.route('/shelters', methods=['GET'])
def list_shelters_action():

    filters = {field: value for field in FILTERABLE_FIELDS if (value := request.args.get(field))}
    sort_by = request.args.get('sort_by')
    order = request.args.get('dir', 'asc').lower()
    page, per_page = paginate_args()

    resultados = list_shelters(filters=filters, sort_by=sort_by, dir=order, page=page, per_page=per_page)

    response_body = {
        "items": [shelter.serialize() for shelter in resultados.items],
        "page": resultados.page,
        "per_page": resultados.per_page,
        "total_items": resultados.total,
        "total_pages": resultados.pages,
    }

    return jsonify(response_body), 200