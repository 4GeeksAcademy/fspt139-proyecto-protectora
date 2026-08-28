from api.repositories.shelter_repository import ShelterRepository


def list_shelters():
    return ShelterRepository.list_all()
