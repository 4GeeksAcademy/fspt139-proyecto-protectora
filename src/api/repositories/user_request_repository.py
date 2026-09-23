from sqlalchemy.orm import selectinload

from api.models import Request, UserRequest, db


class UserRequestRepository:

    @staticmethod
    def get_by_id(id_):
        return db.session.get(UserRequest, id_)

    @staticmethod
    def get_by_user_request_id(user_request_id):
        return db.session.scalars(
            db.select(UserRequest)
            .options(selectinload(UserRequest.user), selectinload(UserRequest.request))
            .where(UserRequest.user_request_id == user_request_id)
        ).one_or_none()

    @staticmethod
    def list_all():
        return db.session.scalars(db.select(UserRequest)).all()

    # listado (paginado) de las contribuciones de una necesidad concreta, para la vista de la
    # protectora: incluye los datos del usuario que colabora
    @staticmethod
    def list_by_request(request_id, page=1, per_page=20):
        query = db.select(UserRequest).where(
            UserRequest.request_id == request_id
        ).options(selectinload(UserRequest.user)).order_by(UserRequest.created_at.desc())

        return db.paginate(query, page=page, per_page=per_page, error_out=False)

    # listado (paginado) de las colaboraciones de un usuario, para su vista de actividad: incluye la
    # necesidad y su protectora; con answered=True solo las que la protectora ya ha respondido
    @staticmethod
    def list_by_user(user_id, answered=False, page=1, per_page=20):
        query = db.select(UserRequest).where(
            UserRequest.user_id == user_id
        ).options(
            selectinload(UserRequest.request).selectinload(Request.shelter)
        ).order_by(UserRequest.created_at.desc())

        if answered:
            query = query.where(UserRequest.shelter_answer.is_not(None))

        return db.paginate(query, page=page, per_page=per_page, error_out=False)

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
