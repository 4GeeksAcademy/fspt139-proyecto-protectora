from api.models import Request, db


class RequestRepository:

    @staticmethod
    def get_by_id(id_):
        return db.session.get(Request, id_)

    @staticmethod
    def get_by_request_id(request_id):
        return db.session.scalars(
            db.select(Request).where(Request.request_id == request_id)
        ).one_or_none()

    @staticmethod
    def list_all():
        return db.session.scalars(db.select(Request)).all()

    @staticmethod
    def create(**fields):
        request = Request(**fields)
        db.session.add(request)
        return request

    @staticmethod
    def save(request):
        db.session.add(request)
        db.session.commit()
        return request

    @staticmethod
    def delete(request):
        db.session.delete(request)
        db.session.commit()
