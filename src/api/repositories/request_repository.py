from datetime import datetime
from sqlalchemy.orm import selectinload
from api.models import Animal, Request, Shelter, db

#FILTROS ADMITIDOS PARA EL REPOSITORIO ANIMAL
#TIPO LIKE X
LIKE_FILTER_FIELDS = {
    "request_id", "name", "description"
}

#TIPO IGUALDAD
EQUAL_FILTER_FIELDS = {"shelter_id", "animal_id", "request_type_id", "status"}

#FILTROS QUE REQUIEREN JOIN CON OTRA TABLA
JOIN_FILTER_FIELDS = {"shelter_type_id", "animal_type_id"}

FILTERABLE_FIELDS = LIKE_FILTER_FIELDS | EQUAL_FILTER_FIELDS | JOIN_FILTER_FIELDS

#CAMPOS ORDENABLES
SORTABLE_FIELDS = {
    "id", "request_id", "name", "request_deadline", "amount_needed", "request_type_id", "status", "shelter_id", "animal_id", "created_at", "update_at"
}


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
    def list_all(filters=None, sort_by=None, dir='asc', page=1, per_page=10, hide_expired=False):
        query = db.select(Request).options(
            selectinload(Request.request_type),
            selectinload(Request.shelter),
            selectinload(Request.media),
            selectinload(Request.user_requests),
            selectinload(Request.animal).selectinload(Animal.media),
            selectinload(Request.animal).selectinload(Animal.animal_type),
        )

        for field, value in (filters or {}).items():
            if value in (None, ''):
                continue
            if field in JOIN_FILTER_FIELDS:
                if field == "shelter_type_id":
                    query = query.join(Shelter, Request.shelter_id == Shelter.id).where(Shelter.shelter_type_id == value)
                elif field == "animal_type_id":
                    query = query.join(Animal, Request.animal_id == Animal.id).where(Animal.animal_type_id == value)
                continue
            column = getattr(Request, field)
            if isinstance(value, (list, tuple, set)):
                query = query.where(column.in_(value))
            elif field in LIKE_FILTER_FIELDS:
                query = query.where(column.ilike(f"%{value}%"))
            elif field in EQUAL_FILTER_FIELDS:
                query = query.where(column == value)

        if hide_expired:
            query = query.where(db.or_(
                Request.status != "abierta",
                Request.request_deadline.is_(None),
                Request.request_deadline >= datetime.utcnow(),
            ))

        if sort_by in SORTABLE_FIELDS:
            column = getattr(Request, sort_by)
            query = query.order_by(column.desc() if dir == 'desc' else column.asc())

        return db.paginate(query, page=page, per_page=per_page, error_out=False)

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
