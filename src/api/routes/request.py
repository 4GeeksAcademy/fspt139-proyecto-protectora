from flask import jsonify, request

from api.repositories.request_repository import FILTERABLE_FIELDS
from api.services.requests_service import list_requests
from api.utils import paginate_args

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
