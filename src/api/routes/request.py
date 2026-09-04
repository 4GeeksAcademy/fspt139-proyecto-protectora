from flask import jsonify, request

from api.repositories.request_repository import FILTERABLE_FIELDS
from api.services.requests_service import list_requests

from . import api


@api.route('/requests', methods=['GET'])
def list_requests_action():

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

    resultados = list_requests(filters=filters, sort_by=sort_by, dir=order, page=page, per_page=per_page)

    response_body = {
        "items": [req.serialize() for req in resultados.items],
        "page": resultados.page,
        "per_page": resultados.per_page,
        "total_items": resultados.total,
        "total_pages": resultados.pages,
    }

    return jsonify(response_body), 200
