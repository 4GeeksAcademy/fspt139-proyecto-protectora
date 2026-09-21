from api.models import AddoptionRequestQuestion, db


class AddoptionRequestQuestionRepository:

    @staticmethod
    def list_by_addoption_process_id(addoption_process_id):
        return db.session.scalars(
            db.select(AddoptionRequestQuestion).where(
                AddoptionRequestQuestion.addoption_process_id == addoption_process_id)
        ).all()

    @staticmethod
    def create(**fields):
        question = AddoptionRequestQuestion(**fields)
        db.session.add(question)
        return question

    @staticmethod
    def delete_all_for_process(addoption_process_id):
        for question in AddoptionRequestQuestionRepository.list_by_addoption_process_id(addoption_process_id):
            db.session.delete(question)
