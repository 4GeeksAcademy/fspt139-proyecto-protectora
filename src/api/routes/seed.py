import json
import os
from datetime import date, datetime

from flask import jsonify
from api.services.users_service import find_user, create_user, update_user

from api.models import db
############################## BLOQUE DE REPOSITORIOS USADOS
from api.repositories.addoption_request_repository import AddoptionRequestRepository
from api.repositories.animal_media_repository import AnimalMediaRepository
from api.repositories.animal_repository import AnimalRepository
from api.repositories.animal_type_repository import AnimalTypeRepository
from api.repositories.request_repository import RequestRepository
from api.repositories.shelter_repository import ShelterRepository
from api.repositories.shelter_type_repository import ShelterTypeRepository
from api.repositories.user_request_repository import UserRequestRepository
from api.repositories.user_review_repository import UserReviewRepository
from api.repositories.request_type_repository import RequestTypeRepository
from api.repositories.addoption_process_repository import AddoptionProcessRepository
from api.repositories.addoption_process_requirement_repository import AddoptionProcessRequirementRepository
from api.repositories.addoption_request_answer_repository import AddoptionRequestAnswerRepository
from api.repositories.addoption_request_question_repository import AddoptionRequestQuestionRepository
from api.repositories.animal_type_requirement_repository import AnimalTypeRequirementRepository
from api.services.animals_service import ACTIVADO
from api.services.addoption_process_service import ABIERTO
from api.services.addoption_request_service import PENDIENTE
from api.repositories.request_media_repository import RequestMediaRepository
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
    updated = {} #contador de registros actualizados


    ################ BLOQUE DE MODELOS A CARGAR, SE INSERTAN SI NO EXISTEN YA EN LA BASE DE DATOS ################

    ################ BLOQUE DE RECURSOS, NECESARIA EN PRODUCCION ################
    ##############################
    # Shelter types [RECURSO, NECESARIA EN PRODUCCION]
    ##############################
    created["shelter_types"] = 0
    for item in load("shelter_type.json"):
        if ShelterTypeRepository.get_by_shelter_type_id(item["shelter_type_id"]) is None:

            ShelterTypeRepository.create(**item)
            created["shelter_types"] += 1

    ##############################
    # Animal types [RECURSO, NECESARIA EN PRODUCCION]
    ##############################
    created["animal_types"] = 0
    for item in load("animal_type.json"):
        if AnimalTypeRepository.get_by_animal_type_id(item["animal_type_id"]) is None:

            AnimalTypeRepository.create(**item)
            created["animal_types"] += 1

    ##############################
    # Animal type requirements [RECURSO, NECESARIA EN PRODUCCION]
    ##############################
    created["animal_type_requirements"] = 0
    for item in load("animal_type_requirement.json"):
        if AnimalTypeRequirementRepository.get_by_animal_type_requirement_id(
                item["animal_type_requirement_id"]) is None:

            animal_type = AnimalTypeRepository.get_by_animal_type_id(item["animal_type_id"])

            AnimalTypeRequirementRepository.create(
                animal_type_requirement_id=item["animal_type_requirement_id"],
                animal_type_id=animal_type.id,
                label=item["label"],
                is_checked_by_default=item.get("is_checked_by_default", False),
                position=item.get("position", 0),
            )
            created["animal_type_requirements"] += 1

    ##############################
    # Request types  [RECURSO, NECESARIA EN PRODUCCION]
    ##############################
    created["request_types"] = 0
    for item in load("request_type.json"):
        if RequestTypeRepository.get_by_request_type_id(item["request_type_id"]) is None:

            RequestTypeRepository.create(**item)
            created["request_types"] += 1

    ################ FIN BLOQUE DE RECURSOS, DE AQUI EN ADELANTE SON FAKE MOCKS PARA POPULAR LA BASE DE DESARROLLO  ################

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
    updated["users"] = 0
    for item in load("user.json"):
        shelter_id = None

        if item.get("shelter_id"):
            shelter = ShelterRepository.get_by_shelter_id(item["shelter_id"])
            shelter_id = shelter.id

        data = dict(
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

        user = find_user(item["user_id"])

        if user is None:
            create_user(**data)
            created["users"] += 1
        else:
            update_user(user, **data)
            updated["users"] += 1


    ##############################
    # Animals
    ##############################
    created["animals"] = 0
    for item in load("animal.json"):
        if AnimalRepository.get_by_animal_id(item["animal_id"]) is None:

            animal_type = AnimalTypeRepository.get_by_animal_type_id(item["animal_type_id"])

            shelter_id = None
            if item.get("shelter_id"):
                shelter = ShelterRepository.get_by_shelter_id(item["shelter_id"])
                shelter_id = shelter.id

            AnimalRepository.create(
                animal_id=item["animal_id"],
                name=item["name"],
                sex=item.get("sex"),
                breed=item["breed"],
                size=item["size"],
                weight=item.get("weight"),
                birthdate=date.fromisoformat(
                    item["birthdate"]) if item.get("birthdate") else None,
                activity_level=item.get("activity_level"),
                vaccines=item.get("vaccines"),
                has_microchip=item.get("has_microchip", False),
                is_sterilized=item.get("is_sterilized", False),
                tests_done=item.get("tests_done"),
                special_needs=item.get("special_needs"),
                traits=item.get("traits"),
                lives_with_kids=item.get("lives_with_kids"),
                lives_with_dogs=item.get("lives_with_dogs"),
                lives_with_cats=item.get("lives_with_cats"),
                ideal_home=item.get("ideal_home"),
                story=item["story"],
                animal_type_id=animal_type.id,
                status=item.get("status", ACTIVADO),
                shelter_id=shelter_id,
            )

            created["animals"] += 1

    ##############################
    # Addoption processes (depend on animal/shelter; traen anidados sus requisitos y preguntas)
    ##############################
    created["addoption_processes"] = 0
    for item in load("addoption_process.json"):
        if AddoptionProcessRepository.get_by_addoption_process_id(item["addoption_process_id"]) is None:

            animal = AnimalRepository.get_by_animal_id(item["animal_id"])
            shelter = ShelterRepository.get_by_shelter_id(item["shelter_id"])

            process = AddoptionProcessRepository.create(
                addoption_process_id=item["addoption_process_id"],
                animal_id=animal.id,
                shelter_id=shelter.id,
                concurrent_requests_limit=item.get("concurrent_requests_limit"),
                contribution_amount=item.get("contribution_amount"),
                start_date=date.fromisoformat(item["start_date"]) if item.get("start_date") else None,
                end_date=date.fromisoformat(item["end_date"]) if item.get("end_date") else None,
                status=item.get("status", ABIERTO),
            )
            saved_process = AddoptionProcessRepository.save(process)

            for position, requirement in enumerate(item.get("requirements", [])):
                AddoptionProcessRequirementRepository.create(
                    addoption_process_requirement_id=requirement["addoption_process_requirement_id"],
                    addoption_process_id=saved_process.id,
                    label=requirement["label"],
                    position=position,
                )

            for position, question in enumerate(item.get("questions", [])):
                AddoptionRequestQuestionRepository.create(
                    addoption_request_question_id=question["addoption_request_question_id"],
                    addoption_process_id=saved_process.id,
                    question=question["question"],
                    position=position,
                )

            created["addoption_processes"] += 1

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

            request_type = RequestTypeRepository.get_by_request_type_id(item["request_type_id"])

            RequestRepository.create(
                request_id=item["request_id"],
                shelter_id=shelter_id,
                animal_id=animal_id,
                name=item["name"],
                description=item["description"],
                request_deadline=datetime.fromisoformat(
                    item["request_deadline"]) if item.get("request_deadline") else None,
                amount_needed=item.get("amount_needed"),
                unit=item.get("unit"),
                footnote=item.get("footnote"),
                status=item.get("status", "abierta"),
                request_type_id=request_type.id,
            )

            created["requests"] += 1

    ##############################
    # User requests
    ##############################
    created["user_requests"] = 0
    for item in load("user_request.json"):
        if UserRequestRepository.get_by_user_request_id(item["user_request_id"]) is None:

            user = find_user(item["user_id"])

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
    # Adoption requests (depend on user, animal y opcionalmente el proceso al que aplican)
    ##############################
    created["adoption_requests"] = 0
    for item in load("addoption_request.json"):
        if AddoptionRequestRepository.get_by_addoption_request_id(item["addoption_request_id"]) is None:

            user = find_user(item["user_id"])

            animal = AnimalRepository.get_by_animal_id(item["animal_id"])

            addoption_process_id = None
            if item.get("addoption_process_id"):
                process = AddoptionProcessRepository.get_by_addoption_process_id(item["addoption_process_id"])
                addoption_process_id = process.id if process else None

            addoption_request = AddoptionRequestRepository.create(
                addoption_request_id=item["addoption_request_id"],
                user_id=user.id,
                animal_id=animal.id,
                addoption_process_id=addoption_process_id,
                score=item.get("score", 0),
                status=item.get("status", PENDIENTE),
            )
            saved_request = AddoptionRequestRepository.save(addoption_request)

            for position, answer in enumerate(item.get("answers", [])):
                AddoptionRequestAnswerRepository.create(
                    addoption_request_answer_id=answer["addoption_request_answer_id"],
                    addoption_request_id=saved_request.id,
                    question=answer["question"],
                    answer=answer["answer"],
                    position=position,
                )

            created["adoption_requests"] += 1

    ##############################
    # User reviews (depend on user)
    ##############################
    created["user_reviews"] = 0
    for item in load("user_review.json"):
        if UserReviewRepository.get_by_review_id(item["review_id"]) is None:

            user = find_user(item["user_id"])

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
                is_cover=item.get("is_cover", False),
            )
            
            created["animal_media"] += 1

    ##############################
    # Request media (depend request)
    ##############################
    created["request_media"] = 0
    for item in load("request_media.json"):
        if RequestMediaRepository.get_by_media_id(item["media_id"]) is None:

            necesidad = RequestRepository.get_by_request_id(item["request_id"])
            if necesidad is None:
                continue

            RequestMediaRepository.create(
                media_id=item["media_id"],
                request_id=necesidad.id,
                format=item["format"],
                url=item["url"],
                is_cover=item.get("is_cover", False),
            )
            created["request_media"] += 1

    ########## FIN DE CARGA DE MODELOS, HACEMOS COMMIT DE LA SESION PARA GUARDAR LOS CAMBIOS EN LA BASE DE DATOS ##########
    ##############################
    db.session.commit()
    ##############################

    return jsonify({
        "message": "Database seed completed",
        "created": created,
        "updated": updated,
    }), 200
