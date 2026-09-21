import uuid
from collections import Counter
from datetime import date

from api.repositories.shelter_repository import DIAS_URGENTE, ShelterRepository
from api.repositories.shelter_type_repository import ShelterTypeRepository
from api.services.animals_service import PUBLIC_STATUSES as ANIMAL_PUBLIC_STATUSES
from api.utils import APIException


# campos que la protectora puede modificar desde su panel
EDITABLE_FIELDS = {
    "name", "description", "logo_url", "email", "phone",
    "website", "instagram", "address", "shelter_type_id",
}
REQUIRED_FIELDS = {"name", "email", "phone"}


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


def list_shelters(filters=None, sort_by=None, dir='asc', page=1, per_page=10, has_urgent=False, has_animals=False):
    return ShelterRepository.list_all(
        filters=filters, sort_by=sort_by, dir=dir, page=page, per_page=per_page,
        has_urgent=has_urgent, has_animals=has_animals,
    )


def get_shelter(shelter_id):
    shelter = ShelterRepository.get_by_shelter_id(shelter_id)
    if shelter is None:
        raise APIException("Protectora no encontrada", status_code=404)
    return shelter


def serialize_shelter_detail(shelter):
    necesidades = shelter.requests or []
    abiertas = [n for n in necesidades if n.status == "abierta"]

    return {
        **shelter.serialize(),
        **shelter_metrics(shelter),
        "shelter_type": shelter.shelter_type.serialize(),
        "closed_requests": sum(1 for n in necesidades if n.status == "cerrada"),
        "requests_by_category": dict(Counter(n.request_type.code for n in abiertas)),
    }


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


def update_shelter_profile(shelter_pk, **data):
    shelter = ShelterRepository.get_by_id(shelter_pk)
    if shelter is None:
        raise APIException("Protectora no encontrada", status_code=404)

    cambios = {campo: valor for campo, valor in data.items() if campo in EDITABLE_FIELDS}

    for campo in REQUIRED_FIELDS & cambios.keys():
        if not str(cambios[campo] or "").strip():
            raise APIException(f"El campo {campo} es obligatorio", status_code=400)

    nuevo_email = cambios.get("email")
    if nuevo_email and nuevo_email != shelter.email and ShelterRepository.get_by_email(nuevo_email):
        raise APIException("Ya existe una entidad con ese correo", status_code=409)

    if "shelter_type_id" in cambios:
        tipo = ShelterTypeRepository.get_by_shelter_type_id(cambios["shelter_type_id"])
        if tipo is None:
            raise APIException("El tipo de entidad no es válido", status_code=400)
        cambios["shelter_type_id"] = tipo.id

    for campo, valor in cambios.items():
        setattr(shelter, campo, valor)

    return ShelterRepository.save(shelter)