from flask import jsonify

from api.repositories.animal_type_repository import AnimalTypeRepository
from api.repositories.shelter_type_repository import ShelterTypeRepository

from . import api


@api.route('/data', methods=['GET'])
def application_shared_data_action():
    shelter_types = ShelterTypeRepository.list_all()
    animal_types = AnimalTypeRepository.list_all()

    response_body = {
        "shelter_types": [shelter_type.serialize() for shelter_type in shelter_types],
        "animal_types": [animal_type.serialize() for animal_type in animal_types],
    }

    return jsonify(response_body), 200
