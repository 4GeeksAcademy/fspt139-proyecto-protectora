from api.models import AddoptionRequestAnswer, db


class AddoptionRequestAnswerRepository:

    @staticmethod
    def create(**fields):
        answer = AddoptionRequestAnswer(**fields)
        db.session.add(answer)
        return answer
