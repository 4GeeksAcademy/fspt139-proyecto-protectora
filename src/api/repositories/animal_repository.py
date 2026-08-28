from api.models import Animal, db


class AnimalRepository:

    @staticmethod
    def get_by_id(id_):
        return db.session.get(Animal, id_)

    @staticmethod
    def get_by_animal_id(animal_id):
        return db.session.scalars(
            db.select(Animal).where(Animal.animal_id == animal_id)
        ).one_or_none()

    @staticmethod
    def list_all():
        return db.session.scalars(db.select(Animal)).all()

    @staticmethod
    def create(**fields):
        animal = Animal(**fields)
        db.session.add(animal)
        return animal

    @staticmethod
    def save(animal):
        db.session.add(animal)
        db.session.commit()
        return animal

    @staticmethod
    def delete(animal):
        db.session.delete(animal)
        db.session.commit()
