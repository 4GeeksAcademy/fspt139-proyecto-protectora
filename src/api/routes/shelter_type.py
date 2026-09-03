from flask import jsonify

from api.repositories.shelter_type_repository import ShelterTypeRepository

from . import api


@api.route('/shelter-types', methods=['GET'])
def list_shelter_types_action():
    shelter_types = ShelterTypeRepository.list_all()

    response_body = {
        "items": [shelter_type.serialize() for shelter_type in shelter_types],
    }

    return jsonify(response_body), 200
