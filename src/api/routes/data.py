import random
from api.repositories.request_repository import RequestRepository
from api.repositories.user_request_repository import UserRequestRepository
from api.repositories.shelter_repository import ShelterRepository
from api.repositories.animal_repository import AnimalRepository
from flask import jsonify

from api.repositories.animal_type_repository import AnimalTypeRepository
from api.repositories.shelter_type_repository import ShelterTypeRepository
from api.repositories.request_type_repository import RequestTypeRepository
from api.services.animals_service import PUBLIC_STATUSES
from api.services.requests_service import ABIERTA

from api.services.geolocation_service import locate_ip
from api.utils import get_client_ip
from flask_jwt_extended import jwt_required
from api.services.users_service import get_current_user

from . import api


@api.route('/data', methods=['GET'])
@jwt_required(optional=True)
def application_shared_data_action():
    shelter_types = ShelterTypeRepository.list_all()
    animal_types = AnimalTypeRepository.list_all()
    request_types = RequestTypeRepository.list_all()

    # si hay un usuario logueado con map_positioning propio, se prioriza sobre la IP
    usuario = get_current_user()
    user_location = usuario.map_positioning if usuario else None

    if not user_location:
        client_ip = get_client_ip()
        try:
            user_location = locate_ip(client_ip)
        except Exception:
            user_location = None

    response_body = {
        "shelter_types": [shelter_type.serialize() for shelter_type in shelter_types],
        "animal_types": [animal_type.serialize() for animal_type in animal_types],
        "request_types": [request_type.serialize() for request_type in request_types],
        "user_location": user_location,
    }

    return jsonify(response_body), 200


@api.route('/data/insights', methods=['GET'])
def home_insights_action():

    # solo abiertas, igual que el tablon de Needs
    needs_open_count = RequestRepository.list_all(filters={"status": ABIERTA}, per_page=1, hide_expired=True).total
    animals_available_count = AnimalRepository.list_all(
        filters={"status": PUBLIC_STATUSES}, per_page=1, hide_adopted=True).total
    shelters_count = ShelterRepository.list_all(per_page=1).total

    collaborations_closed_count = 0
    for user_request in UserRequestRepository.list_all():
        if user_request.shelter_answer:
            collaborations_closed_count += 1

    open_needs_page = RequestRepository.list_all(
        filters={"status": ABIERTA}, sort_by="request_deadline", dir="asc", per_page=3, hide_expired=True)
    open_needs = []
    for request in open_needs_page.items:
        open_needs.append(request.serialize())

    # se sortean 3 entre los 12 mas recientes para que el Home vaya rotando
    open_adoptions_page = AnimalRepository.list_all(
        filters={"status": PUBLIC_STATUSES},
        sort_by="created_at",
        dir="desc",
        per_page=12,
        hide_adopted=True
    )
    candidatos = open_adoptions_page.items
    open_adoptions = []
    for animal in random.sample(candidatos, min(3, len(candidatos))):
        open_adoptions.append(animal.serialize())

    response_body = {
        "needs_open": needs_open_count,
        "animals_for_adoption": animals_available_count,
        "registered_shelters": shelters_count,
        "collaborations_closed": collaborations_closed_count,
        "open_needs": open_needs,
        "open_adoptions": open_adoptions,
    }

    return jsonify(response_body), 200
