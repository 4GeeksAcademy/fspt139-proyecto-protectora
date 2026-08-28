from api.models import UserRequest, db


class UserRequestRepository:

    @staticmethod
    def get_by_id(id_):
        return db.session.get(UserRequest, id_)

    @staticmethod
    def get_by_user_request_id(user_request_id):
        return db.session.scalars(
            db.select(UserRequest).where(
                UserRequest.user_request_id == user_request_id)
        ).one_or_none()

    @staticmethod
    def list_all():
        return db.session.scalars(db.select(UserRequest)).all()

    @staticmethod
    def create(**fields):
        user_request = UserRequest(**fields)
        db.session.add(user_request)
        return user_request

    @staticmethod
    def save(user_request):
        db.session.add(user_request)
        db.session.commit()
        return user_request

    @staticmethod
    def delete(user_request):
        db.session.delete(user_request)
        db.session.commit()
