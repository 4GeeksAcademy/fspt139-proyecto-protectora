from api.repositories.animal_repository import AnimalRepository


def list_animals(filters=None, sort_by=None, dir='asc', page=1, per_page=10):
    return AnimalRepository.list_all(filters=filters, sort_by=sort_by, dir=dir, page=page, per_page=per_page)
