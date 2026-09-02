from flask import jsonify

from api.repositories.animal_type_repository import AnimalTypeRepository

from . import api


@api.route('/animal-types', methods=['GET'])
def list_animal_types_action():
    animal_types = AnimalTypeRepository.list_all()

    response_body = {
        "items": [animal_type.serialize() for animal_type in animal_types],
    }

    return jsonify(response_body), 200
