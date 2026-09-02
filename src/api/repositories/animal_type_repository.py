from api.models import AnimalType, db


class AnimalTypeRepository:

    @staticmethod
    def get_by_id(id_):
        return db.session.get(AnimalType, id_)

    @staticmethod
    def get_by_animal_type_id(animal_type_id):
        return db.session.scalars(
            db.select(AnimalType).where(
                AnimalType.animal_type_id == animal_type_id)
        ).one_or_none()

    @staticmethod
    def list_all():
        return db.session.scalars(db.select(AnimalType)).all()

    @staticmethod
    def create(**fields):
        animal_type = AnimalType(**fields)
        db.session.add(animal_type)
        return animal_type

    @staticmethod
    def save(animal_type):
        db.session.add(animal_type)
        db.session.commit()
        return animal_type

    @staticmethod
    def delete(animal_type):
        db.session.delete(animal_type)
        db.session.commit()
