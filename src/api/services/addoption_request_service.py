import uuid

from api.repositories.addoption_process_repository import AddoptionProcessRepository
from api.repositories.addoption_request_answer_repository import AddoptionRequestAnswerRepository
from api.repositories.addoption_request_repository import AddoptionRequestRepository
from api.services.addoption_process_service import close_addoption_process, get_shelter_addoption_process, is_process_open_for_requests
from api.services.animals_service import get_animal
from api.utils import APIException

PENDIENTE = "pendiente"
ACEPTADA = "aceptada"
DESCARTADA = "descartada"


# el usuario contesta por "addoption_request_question_id" (estable mientras el proceso siga tal cual);
# aqui se casan las respuestas recibidas con las preguntas vigentes del proceso, en el orden del proceso
def _match_answers_to_questions(process, answers):
    answers_by_question_id = {
        (answer or {}).get("addoption_request_question_id"): ((answer or {}).get("answer") or "").strip()
        for answer in (answers or [])
    }

    matched = []
    for question in sorted(process.questions, key=lambda q: q.position):
        texto = answers_by_question_id.get(question.addoption_request_question_id, "").strip()
        if not texto:
            raise APIException(f"Falta responder: {question.question}", status_code=400)
        matched.append((question.question, texto))
    return matched


# cierra el proceso si ya se ha alcanzado (o superado) el limite de solicitudes simultaneas admitido
def _close_process_if_limit_reached(process):
    if process.concurrent_requests_limit is None:
        return
    total_requests = AddoptionRequestRepository.count_by_process(process.id)
    if total_requests >= process.concurrent_requests_limit:
        close_addoption_process(process)


def create_addoption_request(animal_id, user, answers=None):
    animal = get_animal(animal_id)
    process = AddoptionProcessRepository.get_by_animal_id(animal.id)

    if not is_process_open_for_requests(process):
        raise APIException("Este animal no tiene abierto un proceso de adopción ahora mismo", status_code=400)

    if AddoptionRequestRepository.get_by_process_and_user(process.id, user.id) is not None:
        raise APIException("Ya has enviado una solicitud para este proceso de adopción, espera una respuesta de la protectora", status_code=409)

    matched_answers = _match_answers_to_questions(process, answers)

    addoption_request = AddoptionRequestRepository.create(
        addoption_request_id=str(uuid.uuid4()),
        user_id=user.id,
        animal_id=animal.id,
        addoption_process_id=process.id,
        status=PENDIENTE,
    )
    saved_request = AddoptionRequestRepository.save(addoption_request)

    for position, (question_text, answer_text) in enumerate(matched_answers):
        AddoptionRequestAnswerRepository.create(
            addoption_request_answer_id=str(uuid.uuid4()),
            addoption_request_id=saved_request.id,
            question=question_text,
            answer=answer_text,
            position=position,
        )

    _close_process_if_limit_reached(process)

    return AddoptionRequestRepository.save(saved_request)


def _get_owned_addoption_request(addoption_request_id, shelter_id):
    addoption_request = AddoptionRequestRepository.get_by_addoption_request_id(addoption_request_id)
    if addoption_request is None:
        raise APIException("Solicitud de adopción no encontrada", status_code=404)
    if addoption_request.addoption_process is None or addoption_request.addoption_process.shelter_id != shelter_id:
        raise APIException("No tienes permiso para ver esta solicitud", status_code=403)
    return addoption_request


# incluye los datos del solicitante: la protectora necesita saber quien es para valorar la solicitud
def serialize_addoption_request_for_shelter(addoption_request):
    data = addoption_request.serialize()
    data["user"] = addoption_request.user.serialize() if addoption_request.user else None
    return data


# incluye los datos basicos del animal: el colaborador necesita saber por quien pregunto y enlazar a su ficha
def serialize_addoption_request_for_user(addoption_request):
    data = addoption_request.serialize()
    animal = addoption_request.animal
    data["animal"] = {
        "animal_id": animal.animal_id,
        "name": animal.name,
        "shelter_name": animal.shelter.name if animal.shelter else None,
    } if animal else None
    return data


# listado (paginado) de las solicitudes de adopcion del usuario logueado
def list_my_addoption_requests(user_id, status=None, page=1, per_page=20):
    return AddoptionRequestRepository.list_by_user(user_id, status=status, page=page, per_page=per_page)


def get_shelter_addoption_request(addoption_request_id, shelter_id):
    return _get_owned_addoption_request(addoption_request_id, shelter_id)


def list_shelter_addoption_requests(addoption_process_id, shelter_id, filters=None, dir='desc', page=1, per_page=20):
    process = get_shelter_addoption_process(addoption_process_id, shelter_id)
    return AddoptionRequestRepository.list_by_process(process.id, filters=filters, dir=dir, page=page, per_page=per_page)


# aprobar es una accion individual (nunca en bloque): cierra el proceso -si seguia abierto- y
# descarta automaticamente el resto de solicitudes pendientes, para no dejar mas de una aceptada
def accept_addoption_request(addoption_request_id, shelter_id):
    addoption_request = _get_owned_addoption_request(addoption_request_id, shelter_id)
    if addoption_request.status != PENDIENTE:
        raise APIException("Esta solicitud ya ha sido gestionada", status_code=400)

    addoption_request.status = ACEPTADA
    saved_request = AddoptionRequestRepository.save(addoption_request)

    process = addoption_request.addoption_process
    if process is not None:
        close_addoption_process(process)
        for other in process.addoption_requests:
            if other.id != saved_request.id and other.status == PENDIENTE:
                other.status = DESCARTADA
                AddoptionRequestRepository.save(other)

    return saved_request


# descarte en bloque (accion tipo Gmail): ignora en silencio cualquier id que no exista o no
# pertenezca a la protectora, y las que ya estuvieran gestionadas (aceptada/descartada)
def discard_addoption_requests(addoption_request_ids, shelter_id):
    discarded = []
    for addoption_request_id in addoption_request_ids or []:
        addoption_request = AddoptionRequestRepository.get_by_addoption_request_id(addoption_request_id)
        if addoption_request is None:
            continue
        if addoption_request.addoption_process is None or addoption_request.addoption_process.shelter_id != shelter_id:
            continue
        if addoption_request.status != PENDIENTE:
            continue
        addoption_request.status = DESCARTADA
        discarded.append(AddoptionRequestRepository.save(addoption_request))

    return discarded
