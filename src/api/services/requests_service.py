from datetime import datetime

from api.repositories.animal_repository import AnimalRepository
from api.repositories.request_repository import RequestRepository
from api.repositories.request_type_repository import RequestTypeRepository
from api.utils import APIException

NECESIDAD_FIELDS = {"unit", "footnote"}

# estados que el formulario puede pedir (crear/guardar como borrador, o publicar)
SETTABLE_STATUSES = {"abierta", "borrador"}

# estados visibles para cualquier visitante en el tablon publico
PUBLIC_STATUSES = {"abierta", "cerrada"}


def list_requests(filters=None, sort_by=None, dir='asc', page=1, per_page=10):
    return RequestRepository.list_all(filters=filters, sort_by=sort_by, dir=dir, page=page, per_page=per_page)


# limita a una necesidad propia de la protectora (formulario de edicion)
def obtener_necesidad_shelter(request_id, shelter_id):
    necesidad = RequestRepository.get_by_request_id(request_id)
    if necesidad is None:
        raise APIException("Necesidad no encontrada", status_code=404)
    if necesidad.shelter_id != shelter_id:
        raise APIException("No tienes permiso para ver esta necesidad", status_code=403)
    return necesidad

# carga una necesidad publica por su request_id (solo estados publicos)
def get_request(request_id):
    necesidad = RequestRepository.get_by_request_id(request_id)
    if necesidad is None or necesidad.status not in PUBLIC_STATUSES:
        raise APIException("Necesidad no encontrada", status_code=404)
    return necesidad

# crea o actualiza una necesidad (request) de una protectora
def crear_necesidad(request_id, shelter_id=None, **data):

    request_type_public_id = data.get("request_type_id")
    if not request_type_public_id:
        raise APIException("El tipo de ayuda es obligatorio", status_code=400)

    request_type = RequestTypeRepository.get_by_request_type_id(request_type_public_id)
    if request_type is None:
        raise APIException("Tipo de ayuda no encontrado", status_code=404)

    name = (data.get("name") or "").strip()
    if not name:
        raise APIException("El nombre de la necesidad es obligatorio", status_code=400)

    description = (data.get("description") or "").strip()
    if not description:
        raise APIException("Descripcion de la necesidad obligatoria", status_code=400)

    fields = {field: data.get(field) for field in NECESIDAD_FIELDS}
    fields["name"] = name
    fields["description"] = description

    animal_public_id = data.get("animal_id")
    if animal_public_id:
        animal = AnimalRepository.get_by_animal_id(animal_public_id)
        if animal is None:
            raise APIException("Animal no encontrado", status_code=404)
        if animal.shelter_id != shelter_id:
            raise APIException("Ese animal no pertenece a tu protectora", status_code=403)
        fields["animal_id"] = animal.id
    else:
        fields["animal_id"] = None

    request_deadline = data.get("request_deadline")
    if request_deadline:
        try:
            fields["request_deadline"] = datetime.fromisoformat(request_deadline)
        except (TypeError, ValueError):
            raise APIException("Fecha límite inválida", status_code=400)
    else:
        fields["request_deadline"] = None

    amount_needed = data.get("amount_needed")
    if amount_needed in (None, ""):
        fields["amount_needed"] = None
    else:
        try:
            fields["amount_needed"] = float(amount_needed)
        except (TypeError, ValueError):
            raise APIException("Cantidad objetivo inválida", status_code=400)

    status = data.get("status")
    if status is not None and status not in SETTABLE_STATUSES:
        raise APIException("Estado no definido", status_code=400)

    existing = RequestRepository.get_by_request_id(request_id)
    if existing is not None:
        if existing.shelter_id != shelter_id:
            raise APIException("No tienes permiso para modificar esta necesidad", status_code=403)
        for field, value in fields.items():
            setattr(existing, field, value)
        existing.request_type_id = request_type.id
        # al editar solo cambia el estado si se pide explícitamente (p.ej. publicar un borrador)
        if status is not None:
            existing.status = status
        return RequestRepository.save(existing), False   # editada

    necesidad = RequestRepository.create(
        request_id=request_id, request_type_id=request_type.id, shelter_id=shelter_id,
        status=status, **fields
    )
    return RequestRepository.save(necesidad), True        # creada nueva
