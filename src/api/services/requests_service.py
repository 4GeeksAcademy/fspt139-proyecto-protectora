from api.repositories.request_repository import RequestRepository


def list_requests(filters=None, sort_by=None, dir='asc', page=1, per_page=10):
    return RequestRepository.list_all(filters=filters, sort_by=sort_by, dir=dir, page=page, per_page=per_page)
