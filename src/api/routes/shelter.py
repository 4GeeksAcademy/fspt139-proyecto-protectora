from flask import jsonify, request

from api.repositories.shelter_repository import FILTERABLE_FIELDS
from api.services.shelters_service import list_shelters, shelter_metrics
from api.utils import paginate_args

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