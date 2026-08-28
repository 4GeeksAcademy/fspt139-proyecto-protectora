from api.models import User, db


# extraigo los metodos de datos del routes para mantener dependencias separadas
# todo: añadir logica de "is active" para solo usuarios activos


class UserRepository:

    @staticmethod
    def get_by_id(id_):
        return db.session.get(User, id_)

    @staticmethod
    def get_by_user_id(user_id):
        return db.session.scalars(
            db.select(User).where(User.user_id == user_id)
        ).one_or_none()

    @staticmethod
    def get_by_email(email):
        return db.session.scalars(
            db.select(User).where(User.email == email)
        ).one_or_none()

    @staticmethod
    def list_all():
        return db.session.scalars(db.select(User)).all()

    @staticmethod
    def create(**fields):
        user = User(**fields)
        db.session.add(user)
        return user

    @staticmethod
    def save(user):
        db.session.add(user)
        db.session.commit()
        return user

    @staticmethod
    def delete(user):
        db.session.delete(user)
        db.session.commit()
