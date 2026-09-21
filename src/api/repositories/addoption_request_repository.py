from sqlalchemy.orm import selectinload

from api.models import AddoptionRequest, User, db


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
    def get_by_process_and_user(addoption_process_id, user_id):
        return db.session.scalars(
            db.select(AddoptionRequest).where(
                AddoptionRequest.addoption_process_id == addoption_process_id,
                AddoptionRequest.user_id == user_id,
            )
        ).one_or_none()

    @staticmethod
    def count_by_process(addoption_process_id):
        return db.session.scalar(
            db.select(db.func.count()).select_from(AddoptionRequest).where(
                AddoptionRequest.addoption_process_id == addoption_process_id)
        )

    # listado de solicitudes de un proceso concreto, para la vista de la protectora: admite
    # filtro por estado y busqueda por nombre/email del solicitante (requiere join con user)
    @staticmethod
    def list_by_process(addoption_process_id, filters=None, dir='desc', page=1, per_page=20):
        query = db.select(AddoptionRequest).where(
            AddoptionRequest.addoption_process_id == addoption_process_id
        ).options(selectinload(AddoptionRequest.user), selectinload(AddoptionRequest.answers))

        status = (filters or {}).get("status")
        if status:
            query = query.where(AddoptionRequest.status == status)

        search = (filters or {}).get("search")
        if search:
            like = f"%{search}%"
            query = query.join(User, AddoptionRequest.user_id == User.id).where(
                db.or_(
                    User.name.ilike(like),
                    User.last_name1.ilike(like),
                    User.last_name2.ilike(like),
                    User.email.ilike(like),
                )
            )

        query = query.order_by(
            AddoptionRequest.created_at.desc() if dir == 'desc' else AddoptionRequest.created_at.asc())

        return db.paginate(query, page=page, per_page=per_page, error_out=False)

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
