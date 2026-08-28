from flask import jsonify

#from api.repositories.shelter_repository import ShelterRepository
from api.services.shelters_service import list_shelters

from . import api


@api.route('/shelters', methods=['GET'])
def list_action():

    #shelters = ShelterRepository.list_all()       
    #response_body = [shelter.serialize() for shelter in shelters]

    shelters = list_shelters()       
    response_body = [shelter.serialize() for shelter in shelters]


    return jsonify(response_body), 200