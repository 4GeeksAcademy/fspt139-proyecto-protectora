import json
import os
from datetime import date, datetime

from flask import jsonify

from api.models import db
############################## BLOQUE DE REPOSITORIOS USADOS
from api.repositories.addoption_request_repository import AddoptionRequestRepository
from api.repositories.animal_media_repository import AnimalMediaRepository
from api.repositories.animal_repository import AnimalRepository
from api.repositories.animal_type_repository import AnimalTypeRepository
from api.repositories.request_repository import RequestRepository
from api.repositories.shelter_repository import ShelterRepository
from api.repositories.shelter_type_repository import ShelterTypeRepository
from api.repositories.user_repository import UserRepository
from api.repositories.user_request_repository import UserRequestRepository
from api.repositories.user_review_repository import UserReviewRepository
##############################
#1. añadir fichero .json en la carpeta data
#2. añadir bloque de carga en este fichero, siguiendo el patrón de los bloques existentes
#3. llamar al endpoint /seed para cargar los datos en la base de datos
##############################

from . import api

#cargamos de la carpeta data los json y los insertamos en la base de datos si no existen ya, cada bloque un modelo
@api.route("/seed", methods=["GET"])
def seed_database():
    base_path = os.path.join(os.path.dirname(__file__), "..", "data")

    def load(filename):
        with open(os.path.join(base_path, filename), "r", encoding="utf-8") as file:
            return json.load(file)

    created = {} #contador para el resultado


    ################ BLOQUE DE MODELOS A CARGAR, SE INSERTAN SI NO EXISTEN YA EN LA BASE DE DATOS ################
    ##############################
    # Shelter types
    ##############################
    created["shelter_types"] = 0
    for item in load("shelter_type.json"):
        if ShelterTypeRepository.get_by_shelter_type_id(item["shelter_type_id"]) is None:

            ShelterTypeRepository.create(**item)
            created["shelter_types"] += 1

    ##############################
    # Animal types
    ##############################
    created["animal_types"] = 0
    for item in load("animal_type.json"):
        if AnimalTypeRepository.get_by_animal_type_id(item["animal_type_id"]) is None:

            AnimalTypeRepository.create(**item)
            created["animal_types"] += 1

    ##############################
    # Shelters
    ##############################
    created["shelters"] = 0
    for item in load("shelter.json"):
        if ShelterRepository.get_by_shelter_id(item["shelter_id"]) is None:

            shelter_type = ShelterTypeRepository.get_by_shelter_type_id(item["shelter_type_id"])

            ShelterRepository.create(
                shelter_id = item["shelter_id"],
                name = item["name"],
                description = item.get("description"),
                logo_url = item.get("logo_url"),
                email = item["email"],
                phone = item["phone"],
                website = item.get("website"),
                instagram = item.get("instagram"),
                address = item.get("address"),
                map_positioning = item.get("map_positioning"),
                shelter_type_id = shelter_type.id,
            )

            created["shelters"] += 1


    ##############################
    # Users
    ##############################
    created["users"] = 0
    for item in load("user.json"):
        if UserRepository.get_by_user_id(item["user_id"]) is None:
            shelter_id = None

            if item.get("shelter_id"):
                shelter = ShelterRepository.get_by_shelter_id(item["shelter_id"])
                shelter_id = shelter.id

            UserRepository.create(
                user_id=item["user_id"],
                name=item["name"],
                last_name1=item["last_name1"],
                last_name2=item.get("last_name2"),
                phone=item["phone"],
                email=item["email"],
                password=item["password"],
                token_version=item.get("token_version"),
                rol=item["rol"],
                shelter_id=shelter_id,
                ranking=item.get("ranking", 0),
                address=item.get("address"),
                map_positioning=item.get("map_positioning"),
            )

            created["users"] += 1


    ##############################
    # Animals
    ##############################
    created["animals"] = 0
    for item in load("animal.json"):
        if AnimalRepository.get_by_animal_id(item["animal_id"]) is None:

            animal_type = AnimalTypeRepository.get_by_animal_type_id(item["animal_type_id"])

            AnimalRepository.create(
                animal_id=item["animal_id"],
                name=item["name"],
                breed=item["breed"],
                size=item["size"],
                weight=item.get("weight"),
                birthdate=date.fromisoformat(
                    item["birthdate"]) if item.get("birthdate") else None,
                activity_level=item.get("activity_level"),
                story=item["story"],
                animal_type_id=animal_type.id,
            )

            created["animals"] += 1

    ##############################
    # Requests (depend on shelter/animal, both optional)
    ##############################
    created["requests"] = 0
    for item in load("request.json"):
        if RequestRepository.get_by_request_id(item["request_id"]) is None:
            shelter_id = None
            if item.get("shelter_id"):
                shelter = ShelterRepository.get_by_shelter_id(item["shelter_id"])
                shelter_id = shelter.id

            animal_id = None
            if item.get("animal_id"):
                animal = AnimalRepository.get_by_animal_id(item["animal_id"])
                animal_id = animal.id

            RequestRepository.create(
                request_id=item["request_id"],
                shelter_id=shelter_id,
                animal_id=animal_id,
                name=item["name"],
                description=item["description"],
                request_deadline=datetime.fromisoformat(
                    item["request_deadline"]) if item.get("request_deadline") else None,
                amount_needed=item.get("amount_needed", 0.0),
                request_type=item["request_type"],
            )

            created["requests"] += 1

    ##############################
    # User requests
    ##############################
    created["user_requests"] = 0
    for item in load("user_request.json"):
        if UserRequestRepository.get_by_user_request_id(item["user_request_id"]) is None:

            user = UserRepository.get_by_user_id(item["user_id"])

            req = RequestRepository.get_by_request_id(item["request_id"])

            UserRequestRepository.create(
                user_request_id=item["user_request_id"],
                user_id=user.id,
                request_id=req.id,
                amount=item.get("amount", 0.0),
                shelter_answer=item.get("shelter_answer"),
            )

            created["user_requests"] += 1

    ##############################
    # Adoption requests (depend on user, animal)
    ##############################
    created["adoption_requests"] = 0
    for item in load("addoption_request.json"):
        if AddoptionRequestRepository.get_by_addoption_request_id(item["addoption_request_id"]) is None:

            user = UserRepository.get_by_user_id(item["user_id"])

            animal = AnimalRepository.get_by_animal_id(item["animal_id"])

            AddoptionRequestRepository.create(
                addoption_request_id=item["addoption_request_id"],
                user_id=user.id,
                animal_id=animal.id,
                score=item.get("score", 0),
                is_accepted=item["is_accepted"],
            )

            created["adoption_requests"] += 1

    ##############################
    # User reviews (depend on user)
    ##############################
    created["user_reviews"] = 0
    for item in load("user_review.json"):
        if UserReviewRepository.get_by_review_id(item["review_id"]) is None:

            user = UserRepository.get_by_user_id(item["user_id"])

            UserReviewRepository.create(
                user_id=user.id,
                review_id=item["review_id"],
                ranking=item.get("ranking", 1),
                review=item.get("review"),
            )

            created["user_reviews"] += 1

    ##############################
    # Animal media (depend on animal)
    ##############################
    created["animal_media"] = 0
    for item in load("animal_media.json"):
        if AnimalMediaRepository.get_by_media_id(item["media_id"]) is None:

            animal = AnimalRepository.get_by_animal_id(item["animal_id"])

            AnimalMediaRepository.create(
                media_id=item["media_id"],
                animal_id=animal.id,
                format=item["format"],
                url=item["url"],
            )
            
            created["animal_media"] += 1

    ########## FIN DE CARGA DE MODELOS, HACEMOS COMMIT DE LA SESION PARA GUARDAR LOS CAMBIOS EN LA BASE DE DATOS ##########
    ##############################
    db.session.commit()
    ##############################

    return jsonify({
        "message": "Database seed completed",
        "created": created,
    }), 200
