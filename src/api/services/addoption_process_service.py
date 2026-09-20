import uuid
from datetime import date

from api.repositories.addoption_process_repository import AddoptionProcessRepository
from api.repositories.addoption_process_requirement_repository import AddoptionProcessRequirementRepository
from api.repositories.addoption_request_question_repository import AddoptionRequestQuestionRepository
from api.repositories.animal_repository import AnimalRepository
from api.services.animals_service import get_animal
from api.utils import APIException

# "una a una" (1) / "hasta N" (entero personalizado) / "sin limite" (None) -- lo que ofrece el formulario de la protectora
CONCURRENT_REQUESTS_CUSTOM_MIN = 2
CONCURRENT_REQUESTS_CUSTOM_MAX = 100

# unica fuente de verdad de AddoptionProcess.status
ABIERTO = "abierto"
CERRADO = "cerrado"


def _get_owned_animal(animal_id, shelter_id):
    animal = AnimalRepository.get_by_animal_id(animal_id)
    if animal is None:
        raise APIException("Animal no encontrado", status_code=404)
    if animal.shelter_id != shelter_id:
        raise APIException("No tienes permiso para modificar este animal", status_code=403)
    return animal


def _parse_concurrent_requests_limit(value):
    if value is None:
        return None
    try:
        value = int(value)
    except (TypeError, ValueError):
        raise APIException("Límite de solicitudes concurrentes inválido", status_code=400)

    if value == 1 or CONCURRENT_REQUESTS_CUSTOM_MIN <= value <= CONCURRENT_REQUESTS_CUSTOM_MAX:
        return value
    raise APIException("Límite de solicitudes concurrentes inválido", status_code=400)


def _parse_contribution_amount(value):
    if value in (None, ""):
        return None
    try:
        return round(float(value), 2)
    except (TypeError, ValueError):
        raise APIException("Aportación inválida", status_code=400)


def _parse_date(value, field_label):
    if value in (None, ""):
        return None
    try:
        return date.fromisoformat(value)
    except (TypeError, ValueError):
        raise APIException(f"{field_label} inválida", status_code=400)


# acota el proceso con inicio-fin, solo fin (fecha limite), o sin fecha -- no se admite
# "solo inicio" porque no delimita nada por si sola
def _parse_date_range(start_date, end_date):
    start_date = _parse_date(start_date, "Fecha de inicio")
    end_date = _parse_date(end_date, "Fecha límite")

    if start_date is not None and end_date is None:
        raise APIException("La fecha de inicio requiere también una fecha límite", status_code=400)
    if start_date is not None and end_date is not None and start_date > end_date:
        raise APIException("La fecha de inicio debe ser anterior a la fecha límite", status_code=400)

    return start_date, end_date


def get_addoption_process_by_animal(animal_id, shelter_id):
    animal = _get_owned_animal(animal_id, shelter_id)
    return AddoptionProcessRepository.get_by_animal_id(animal.id)


def get_shelter_addoption_process(addoption_process_id, shelter_id):
    process = AddoptionProcessRepository.get_by_addoption_process_id(addoption_process_id)
    if process is None:
        raise APIException("Proceso de adopción no encontrado", status_code=404)
    if process.shelter_id != shelter_id:
        raise APIException("No tienes permiso para ver este proceso de adopción", status_code=403)
    return process


# solo se puede eliminar un proceso que todavia no ha recibido ninguna solicitud de adopcion;
# si ya tiene alguna, la protectora debe cerrarlo en vez de borrarlo (conserva el historial)
def delete_addoption_process(addoption_process_id, shelter_id):
    process = get_shelter_addoption_process(addoption_process_id, shelter_id)
    if process.addoption_requests:
        raise APIException(
            "No se puede eliminar un proceso que ya tiene solicitudes de adopción", status_code=400)
    AddoptionProcessRepository.delete(process)


# listado del panel /panel/adopciones: como un proceso es 1:1 con su animal, cada fila ya
# representa "el proceso de ese animal" (agrupado por animal de forma natural)
def list_shelter_addoption_processes(shelter_id, filters=None, dir='desc', page=1, per_page=12):
    filters = dict(filters or {})
    if filters.pop("has_pending", None):
        # import local para evitar el ciclo: addoption_request_service ya importa de este modulo,
        # asi que PENDIENTE (dueño: addoption_request_service) no se puede importar aqui arriba
        from api.services.addoption_request_service import PENDIENTE
        filters["pending_status"] = PENDIENTE
    return AddoptionProcessRepository.list_by_shelter(shelter_id, filters=filters, dir=dir, page=page, per_page=per_page)


# resumen para el panel de protectora: info del proceso + animal + recuento de solicitudes
# y la fecha de la ultima, sin serializar el animal entero (de sobra para una tarjeta/cabecera)
def serialize_shelter_addoption_process(process):
    from api.services.addoption_request_service import PENDIENTE  # ver nota de import local arriba

    data = process.serialize()
    requests = process.addoption_requests
    latest = max((r.created_at for r in requests if r.created_at), default=None)

    animal = process.animal
    data["animal"] = {
        "animal_id": animal.animal_id,
        "name": animal.name,
        "status": animal.status,
        "animal_type_id": animal.animal_type_id,
        "cover_image": next((m.url for m in animal.media if m.is_cover), None),
    } if animal else None
    data["request_count"] = len(requests)
    data["pending_count"] = sum(1 for r in requests if r.status == PENDIENTE)
    data["latest_request_at"] = latest.isoformat() if latest else None
    return data


# un proceso admite solicitudes si esta "abierto" y, si tiene fechas, hoy cae dentro del rango
def is_process_open_for_requests(process):
    if process is None or process.status != ABIERTO:
        return False
    today = date.today()
    if process.start_date and today < process.start_date:
        return False
    if process.end_date and today > process.end_date:
        return False
    return True


# version publica: solo animales visibles (get_animal ya filtra por status), sin exponer nada de la protectora
def get_public_addoption_process(animal_id):
    animal = get_animal(animal_id)
    return AddoptionProcessRepository.get_by_animal_id(animal.id)


def serialize_public_addoption_process(process):
    data = process.serialize()
    data["is_open_for_requests"] = is_process_open_for_requests(process)
    return data


# unico punto que cierra un proceso: lo usan tanto el limite de solicitudes simultaneas
# como la aceptacion de una solicitud (ver addoption_request_service.py)
def close_addoption_process(process):
    if process.status == CERRADO:
        return process
    process.status = CERRADO
    return AddoptionProcessRepository.save(process)


# cambio manual de estado desde el panel (boton Cerrar/Reabrir): igual que al abrir el proceso,
# reabrir no comprueba nada mas y siempre lo deja disponible para nuevas solicitudes
def set_addoption_process_status(addoption_process_id, shelter_id, status):
    if status not in (ABIERTO, CERRADO):
        raise APIException("Estado de proceso inválido", status_code=400)

    process = get_shelter_addoption_process(addoption_process_id, shelter_id)

    if status == CERRADO:
        return close_addoption_process(process)

    if process.status != ABIERTO:
        process.status = ABIERTO
        process = AddoptionProcessRepository.save(process)
    return process


# abre (o actualiza, si ya habia uno) el proceso de adopcion de un animal propio de la protectora;
# arrastra siempre el listado completo de requisitos y preguntas por el recibido en el formulario borrando el anterior
def open_addoption_process(animal_id, shelter_id, concurrent_requests_limit=None,
                            contribution_amount=None, start_date=None, end_date=None,
                            requirements=None, questions=None):
    animal = _get_owned_animal(animal_id, shelter_id)

    concurrent_requests_limit = _parse_concurrent_requests_limit(concurrent_requests_limit)
    contribution_amount = _parse_contribution_amount(contribution_amount)
    start_date, end_date = _parse_date_range(start_date, end_date)
    requirement_labels = [label.strip() for label in (requirements or []) if label and label.strip()]
    question_texts = [text.strip() for text in (questions or []) if text and text.strip()]

    process = AddoptionProcessRepository.get_by_animal_id(animal.id)
    if process is None:
        process = AddoptionProcessRepository.create(
            addoption_process_id=str(uuid.uuid4()),
            animal_id=animal.id,
            shelter_id=shelter_id,
        )
    else:
        AddoptionProcessRequirementRepository.delete_all_for_process(process.id)
        AddoptionRequestQuestionRepository.delete_all_for_process(process.id)

    process.concurrent_requests_limit = concurrent_requests_limit
    process.contribution_amount = contribution_amount
    process.start_date = start_date
    process.end_date = end_date
    process.status = ABIERTO

    saved_process = AddoptionProcessRepository.save(process)

    for position, label in enumerate(requirement_labels):
        AddoptionProcessRequirementRepository.create(
            addoption_process_requirement_id=str(uuid.uuid4()),
            addoption_process_id=saved_process.id,
            label=label,
            position=position,
        )

    for position, question_text in enumerate(question_texts):
        AddoptionRequestQuestionRepository.create(
            addoption_request_question_id=str(uuid.uuid4()),
            addoption_process_id=saved_process.id,
            question=question_text,
            position=position,
        )

    return AddoptionProcessRepository.save(saved_process)
