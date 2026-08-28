from api.models import Shelter, db


class ShelterRepository:

    @staticmethod
    def get_by_id(id_):
        return db.session.get(Shelter, id_)

    @staticmethod
    def get_by_shelter_id(shelter_id):
        return db.session.scalars(
            db.select(Shelter).where(Shelter.shelter_id == shelter_id)
        ).one_or_none()

    @staticmethod
    def list_all():
        return db.session.scalars(db.select(Shelter)).all()

    @staticmethod
    def create(**fields):
        shelter = Shelter(**fields)
        db.session.add(shelter)
        return shelter

    @staticmethod
    def save(shelter):
        db.session.add(shelter)
        db.session.commit()
        return shelter

    @staticmethod
    def delete(shelter):
        db.session.delete(shelter)
        db.session.commit()
