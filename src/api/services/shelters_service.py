import uuid

from api.repositories.shelter_repository import ShelterRepository
from api.repositories.shelter_type_repository import ShelterTypeRepository
from api.utils import APIException


def list_shelters(filters=None, sort_by=None, dir='asc', page=1, per_page=10):
    return ShelterRepository.list_all(filters=filters, sort_by=sort_by, dir=dir, page=page, per_page=per_page)


def create_shelter(**data):
    shelter_type_id = data.pop("shelter_type_id", None)
    shelter_type = ShelterTypeRepository.get_by_shelter_type_id(shelter_type_id)

    if shelter_type is None:
        raise APIException("El tipo de entidad no es válido", status_code=400)

    data["shelter_type_id"] = shelter_type.id
    data["shelter_id"] = data.get("shelter_id") or str(uuid.uuid4())

    return ShelterRepository.create(**data)