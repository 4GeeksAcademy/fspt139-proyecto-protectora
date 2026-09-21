import uuid

from datetime import date

from api.repositories.shelter_repository import DIAS_URGENTE, ShelterRepository
from api.repositories.shelter_type_repository import ShelterTypeRepository
from api.services.animals_service import PUBLIC_STATUSES as ANIMAL_PUBLIC_STATUSES
from api.utils import APIException



def _es_urgente(necesidad):
    if necesidad.status != "abierta" or necesidad.request_deadline is None:
        return False
    dias = (necesidad.request_deadline.date() - date.today()).days
    return 0 <= dias <= DIAS_URGENTE


def shelter_metrics(shelter):
    necesidades = shelter.requests or []
    animales = shelter.animals or []

    abiertas = [n for n in necesidades if n.status == "abierta"]
    colaboradores = {
        colaboracion.user_id
        for necesidad in necesidades
        for colaboracion in (necesidad.user_requests or [])
    }

    return {
        "open_requests": len(abiertas),
        "published_animals": len([a for a in animales if a.status in ANIMAL_PUBLIC_STATUSES]),
        "supporters": len(colaboradores),
        "has_urgent": any(_es_urgente(n) for n in abiertas),
    }


def list_shelters(filters=None, sort_by=None, dir='asc', page=1, per_page=10,has_urgent=False, has_animals=False):
    return ShelterRepository.list_all(filters=filters, sort_by=sort_by, dir=dir, page=page, per_page=per_page, has_urgent=has_urgent, has_animals=has_animals,
    )


def create_shelter(**data):
    if ShelterRepository.get_by_email(data.get("email")):
        raise APIException("Ya existe una entidad con ese correo", status_code=409)

    shelter_type_id = data.pop("shelter_type_id", None)
    shelter_type = ShelterTypeRepository.get_by_shelter_type_id(shelter_type_id)

    if shelter_type is None:
        raise APIException("El tipo de entidad no es válido", status_code=400)

    data["shelter_type_id"] = shelter_type.id
    data["shelter_id"] = data.get("shelter_id") or str(uuid.uuid4())

    return ShelterRepository.create(**data)