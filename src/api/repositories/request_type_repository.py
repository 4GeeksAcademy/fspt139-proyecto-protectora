from api.models import RequestType, db


class RequestTypeRepository:

    @staticmethod
    def get_by_id(id_):
        return db.session.get(RequestType, id_)

    @staticmethod
    def get_by_request_type_id(request_type_id):
        return db.session.scalars(db.select(RequestType).where(RequestType.request_type_id == request_type_id)).one_or_none()

    @staticmethod
    def get_by_code(code):
        return db.session.scalars(db.select(RequestType).where(RequestType.code == code)).one_or_none()

    @staticmethod
    def list_all():
        return db.session.scalars(db.select(RequestType)).all()

    @staticmethod
    def create(**fields):
        request_type = RequestType(**fields)
        db.session.add(request_type)
        return request_type

    @staticmethod
    def save(request_type):
        db.session.add(request_type)
        db.session.commit()
        return request_type

    @staticmethod
    def delete(request_type):
        db.session.delete(request_type)
        db.session.commit()
