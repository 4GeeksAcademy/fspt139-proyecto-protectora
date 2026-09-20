from api.models import AnimalTypeRequirement, db


class AnimalTypeRequirementRepository:

    @staticmethod
    def get_by_animal_type_requirement_id(animal_type_requirement_id):
        return db.session.scalars(
            db.select(AnimalTypeRequirement).where(
                AnimalTypeRequirement.animal_type_requirement_id == animal_type_requirement_id)
        ).one_or_none()

    @staticmethod
    def list_by_animal_type_id(animal_type_id):
        return db.session.scalars(
            db.select(AnimalTypeRequirement).where(
                AnimalTypeRequirement.animal_type_id == animal_type_id)
        ).all()

    @staticmethod
    def create(**fields):
        requirement = AnimalTypeRequirement(**fields)
        db.session.add(requirement)
        return requirement

    @staticmethod
    def save(requirement):
        db.session.add(requirement)
        db.session.commit()
        return requirement

    @staticmethod
    def delete(requirement):
        db.session.delete(requirement)
        db.session.commit()
