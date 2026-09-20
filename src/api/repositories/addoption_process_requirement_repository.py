from api.models import AddoptionProcessRequirement, db


class AddoptionProcessRequirementRepository:

    @staticmethod
    def list_by_addoption_process_id(addoption_process_id):
        return db.session.scalars(
            db.select(AddoptionProcessRequirement).where(
                AddoptionProcessRequirement.addoption_process_id == addoption_process_id)
        ).all()

    @staticmethod
    def create(**fields):
        requirement = AddoptionProcessRequirement(**fields)
        db.session.add(requirement)
        return requirement

    @staticmethod
    def delete_all_for_process(addoption_process_id):
        for requirement in AddoptionProcessRequirementRepository.list_by_addoption_process_id(addoption_process_id):
            db.session.delete(requirement)
