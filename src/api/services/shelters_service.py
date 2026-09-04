from api.repositories.shelter_repository import ShelterRepository


def list_shelters(filters=None, sort_by=None, dir='asc', page=1, per_page=10):
    return ShelterRepository.list_all(filters=filters, sort_by=sort_by, dir=dir, page=page, per_page=per_page)
