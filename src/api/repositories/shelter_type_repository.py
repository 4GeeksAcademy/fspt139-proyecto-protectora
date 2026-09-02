from api.models import ShelterType, db


class ShelterTypeRepository:

    @staticmethod
    def get_by_id(id_):
        return db.session.get(ShelterType, id_)

    @staticmethod
    def get_by_shelter_type_id(shelter_type_id):
        return db.session.scalars(
            db.select(ShelterType).where(
                ShelterType.shelter_type_id == shelter_type_id)
        ).one_or_none()

    @staticmethod
    def list_all():
        return db.session.scalars(db.select(ShelterType)).all()

    @staticmethod
    def create(**fields):
        shelter_type = ShelterType(**fields)
        db.session.add(shelter_type)
        return shelter_type

    @staticmethod
    def save(shelter_type):
        db.session.add(shelter_type)
        db.session.commit()
        return shelter_type

    @staticmethod
    def delete(shelter_type):
        db.session.delete(shelter_type)
        db.session.commit()
