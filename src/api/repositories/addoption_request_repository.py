from api.models import AddoptionRequest, db


class AddoptionRequestRepository:

    @staticmethod
    def get_by_id(id_):
        return db.session.get(AddoptionRequest, id_)

    @staticmethod
    def get_by_addoption_request_id(addoption_request_id):
        return db.session.scalars(
            db.select(AddoptionRequest).where(
                AddoptionRequest.addoption_request_id == addoption_request_id)
        ).one_or_none()

    @staticmethod
    def list_all():
        return db.session.scalars(db.select(AddoptionRequest)).all()

    @staticmethod
    def create(**fields):
        addoption_request = AddoptionRequest(**fields)
        db.session.add(addoption_request)
        return addoption_request

    @staticmethod
    def save(addoption_request):
        db.session.add(addoption_request)
        db.session.commit()
        return addoption_request

    @staticmethod
    def delete(addoption_request):
        db.session.delete(addoption_request)
        db.session.commit()
