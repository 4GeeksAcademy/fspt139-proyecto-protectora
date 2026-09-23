import uuid

from api.repositories.request_repository import RequestRepository
from api.repositories.user_request_repository import UserRequestRepository
from api.repositories.user_review_repository import UserReviewRepository
from api.services.requests_service import ABIERTA, CERRADA, get_request, is_request_contributable, obtener_necesidad_shelter
from api.utils import APIException


# cierra la necesidad si, sumando esta colaboracion, se alcanza (o supera) la cantidad objetivo;
def _close_request_if_conseguido(necesidad):
    if necesidad.amount_needed is None or necesidad.status != ABIERTA:
        return
    total = sum((c.amount or 0) for c in necesidad.user_requests)
    if float(total) >= float(necesidad.amount_needed):
        necesidad.status = CERRADA
        RequestRepository.save(necesidad)


def validar_cantidad(amount):
    if amount in (None, ""):
        return None
    try:
        amount = float(amount)
    except (TypeError, ValueError):
        raise APIException("Cantidad inválida", status_code=400)
    if amount <= 0:
        raise APIException("La cantidad debe ser mayor que cero", status_code=400)
    return amount

# crea una entidad colaboracion
def create_user_request(request_id, user, amount=None, details=None):
    necesidad = get_request(request_id)

    if not is_request_contributable(necesidad):
        raise APIException("Esta necesidad no admite colaboraciones ahora mismo", status_code=400)

    amount = validar_cantidad(amount)
    if amount is None and necesidad.amount_needed is not None:
        raise APIException("Indica cuánto quieres aportar", status_code=400)

    details = (details or "").strip() or None

    if amount is None and details is None:
        raise APIException("Indica una cantidad o cuéntanos cómo puedes ayudar", status_code=400)

    user_request = UserRequestRepository.create(
        user_request_id=str(uuid.uuid4()),
        user_id=user.id,
        request_id=necesidad.id,
        amount=amount,
        details=details,
        shelter_answer=None,
    )
    saved_user_request = UserRequestRepository.save(user_request)

    _close_request_if_conseguido(necesidad)

    return saved_user_request


# incluye los datos del usuario que colabora: la protectora necesita saber quien es para responderle
def serialize_user_request_for_shelter(user_request):
    data = user_request.serialize()
    data["user"] = user_request.user.serialize() if user_request.user else None
    return data

# incluye los datos basicos de la necesidad: el colaborador necesita saber a que ayudo y enlazar a su ficha
def serialize_user_request_for_user(user_request):
    data = user_request.serialize()
    necesidad = user_request.request
    data["request"] = {
        "request_id": necesidad.request_id,
        "name": necesidad.name,
        "unit": necesidad.unit,
        "status": necesidad.status,
        "shelter_name": necesidad.shelter.name if necesidad.shelter else None,
    } if necesidad else None
    return data


# listado (paginado) de las colaboraciones del usuario logueado
def list_my_user_requests(user_id, answered=False, page=1, per_page=20):
    return UserRequestRepository.list_by_user(user_id, answered=answered, page=page, per_page=per_page)


# listado (paginado) de las contribuciones de una necesidad propia de la protectora
def list_shelter_user_requests(request_id, shelter_id, page=1, per_page=20):
    necesidad = obtener_necesidad_shelter(request_id, shelter_id)
    return UserRequestRepository.list_by_request(necesidad.id, page=page, per_page=per_page)


def _get_owned_user_request(user_request_id, shelter_id):
    user_request = UserRequestRepository.get_by_user_request_id(user_request_id)
    if user_request is None:
        raise APIException("Contribución no encontrada", status_code=404)
    if user_request.request is None or user_request.request.shelter_id != shelter_id:
        raise APIException("No tienes permiso para responder a esta contribución", status_code=403)
    return user_request


# valida y crea la valoracion (UserReview) del usuario que ha colaborado; solo se usa al
# responder de una en una, nunca en el descarte/respuesta en bloque
def _crear_valoracion(user_id, review):
    ranking = review.get("ranking")
    try:
        ranking = int(ranking)
    except (TypeError, ValueError):
        raise APIException("La valoración debe ser un número", status_code=400)
    if not 1 <= ranking <= 5:
        raise APIException("La valoración debe estar entre 1 y 5", status_code=400)

    texto = (review.get("review") or "").strip() or None

    user_review = UserReviewRepository.create(
        review_id=str(uuid.uuid4()),
        user_id=user_id,
        ranking=ranking,
        review=texto,
    )
    return UserReviewRepository.save(user_review)


# respuesta individual: permite ademas dejar una valoracion (UserReview) sobre quien colabora
def answer_user_request(user_request_id, shelter_id, shelter_answer, review=None):
    user_request = _get_owned_user_request(user_request_id, shelter_id)

    shelter_answer = (shelter_answer or "").strip()
    if not shelter_answer:
        raise APIException("Escribe una respuesta para la persona que ha colaborado", status_code=400)

    user_request.shelter_answer = shelter_answer
    saved = UserRequestRepository.save(user_request)

    if review:
        _crear_valoracion(saved.user_id, review)

    return saved


# respuesta en bloque (seleccion multiple tipo Gmail): mismo mensaje para todas las
# contribuciones seleccionadas; ignora en silencio las que no existan o no sean de la protectora
def answer_user_requests_bulk(user_request_ids, shelter_id, shelter_answer):
    shelter_answer = (shelter_answer or "").strip()
    if not shelter_answer:
        raise APIException("Escribe una respuesta para las contribuciones seleccionadas", status_code=400)

    answered = []
    for user_request_id in user_request_ids or []:
        user_request = UserRequestRepository.get_by_user_request_id(user_request_id)
        if user_request is None:
            continue
        if user_request.request is None or user_request.request.shelter_id != shelter_id:
            continue
        user_request.shelter_answer = shelter_answer
        answered.append(UserRequestRepository.save(user_request))

    return answered
