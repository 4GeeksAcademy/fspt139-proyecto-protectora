from datetime import date

from api.repositories.animal_repository import AnimalRepository
from api.repositories.animal_type_repository import AnimalTypeRepository
from api.utils import APIException

ANIMAL_FIELDS = {
    "name", "breed", "size", "weight", "birthdate", "activity_level", "story",
    "sex", "vaccines", "has_microchip", "is_sterilized", "tests_done",
    "special_needs", "traits", "lives_with_kids", "lives_with_dogs",
    "lives_with_cats", "ideal_home",
}

# estados que el formulario puede pedir explícitamente (crear como borrador/disponible, o publicar un borrador ya editado)
SETTABLE_STATUSES = {"disponible", "borrador"}


def list_animals(filters=None, sort_by=None, dir='asc', page=1, per_page=10):
    return AnimalRepository.list_all(filters=filters, sort_by=sort_by, dir=dir,
    page=page, per_page=per_page)

# limita a un animal propio de la protectora (formulario de edicion)
def get_shelter_animal(animal_id, shelter_id):
    animal = AnimalRepository.get_by_animal_id(animal_id)
    if animal is None:
        raise APIException("Animal no encontrado", status_code=404)
    if animal.shelter_id != shelter_id:
        raise APIException("No tienes permiso para ver este animal", status_code=403)
    return animal

# carga un animal publico por id (solo disponibles)
def get_animal(animal_id):
    animal = AnimalRepository.get_by_animal_id(animal_id)
    if animal is None or animal.status != "disponible":
        raise APIException("Animal no encontrado", status_code=404)
    return animal

# crea o actualiza un animal
def upsert_animal(animal_id, shelter_id=None, **data):

    animal_type_public_id = data.get("animal_type_id")
    if not animal_type_public_id:
        raise APIException("La especie es obligatoria", status_code=400)

    animal_type = AnimalTypeRepository.get_by_animal_type_id(animal_type_public_id)
    if animal_type is None:
        raise APIException("Especie no encontrada", status_code=404)

    name = (data.get("name") or "").strip()
    if not name:
        raise APIException("El nombre es obligatorio", status_code=400)

    fields = {field: data.get(field) for field in ANIMAL_FIELDS}
    fields["name"] = name
    fields["breed"] = (fields.get("breed") or "Mestiza").strip() or "Mestiza"
    fields["size"] = fields.get("size") or "Mediano"
    fields["story"] = fields.get("story") or ""

    birthdate = fields.get("birthdate")
    if birthdate:
        try:
            fields["birthdate"] = date.fromisoformat(birthdate)
        except (TypeError, ValueError):
            raise APIException("Fecha de nacimiento inválida", status_code=400)
    else:
        fields["birthdate"] = None

    weight = fields.get("weight")
    if weight in (None, ""):
        fields["weight"] = None
    else:
        try:
            fields["weight"] = float(weight)
        except (TypeError, ValueError):
            raise APIException("Peso inválido", status_code=400)

    fields["has_microchip"] = bool(fields.get("has_microchip"))
    fields["is_sterilized"] = bool(fields.get("is_sterilized"))

    traits = fields.get("traits")
    fields["traits"] = ", ".join(traits) if isinstance(traits, list) else (traits or None)

    status = data.get("status")
    if status is not None and status not in SETTABLE_STATUSES:
        raise APIException("Estado inválido", status_code=400)

    existing = AnimalRepository.get_by_animal_id(animal_id)
    if existing is not None:
        if existing.shelter_id != shelter_id:
            raise APIException("No tienes permiso para modificar este animal", status_code=403)
        for field, value in fields.items():
            setattr(existing, field, value)
        existing.animal_type_id = animal_type.id
        # al editar solo cambia el estado si se pide explícitamente (p.ej. publicar un borrador)
        if status is not None:
            existing.status = status
        return AnimalRepository.save(existing), False   # editado

    animal = AnimalRepository.create(
        animal_id=animal_id, animal_type_id=animal_type.id, shelter_id=shelter_id,
        status=status or "disponible", **fields
    )
    return AnimalRepository.save(animal), True          # creado nuevo
