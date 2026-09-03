from api.models import Shelter, db

#FILTROS ADMITIDOS PARA EL REPOSITORIO SHELTER
#TIPO LIKE X
LIKE_FILTER_FIELDS = {
    "shelter_id", "name", "description", "email", "phone", "website", "instagram", "address"
}

#TIPO IGUALDAD
EQUAL_FILTER_FIELDS = {"shelter_type_id"}
FILTERABLE_FIELDS = LIKE_FILTER_FIELDS | EQUAL_FILTER_FIELDS

#CAMPOS ORDENABLES
SORTABLE_FIELDS = {
    "id", "shelter_id", "name", "email", "phone", "address", "shelter_type_id", "created_at", "update_at"
}


class ShelterRepository:

    @staticmethod
    def get_by_id(id_):
        return db.session.get(Shelter, id_)

    @staticmethod
    def get_by_shelter_id(shelter_id):
        return db.session.scalars(
            db.select(Shelter).where(Shelter.shelter_id == shelter_id)
        ).one_or_none()

    @staticmethod
    def list_all(filters=None, sort_by=None, dir='asc', page=1, per_page=10):
        query = db.select(Shelter)

        for field, value in (filters or {}).items():
            if value in (None, ''):
                continue
            column = getattr(Shelter, field)
            if field in LIKE_FILTER_FIELDS:
                query = query.where(column.ilike(f"%{value}%"))
            elif field in EQUAL_FILTER_FIELDS:
                query = query.where(column == value)

        if sort_by in SORTABLE_FIELDS:
            column = getattr(Shelter, sort_by)
            query = query.order_by(column.desc() if dir == 'desc' else column.asc())

        return db.paginate(query, page=page, per_page=per_page, error_out=False)

    @staticmethod
    def create(**fields):
        shelter = Shelter(**fields)
        db.session.add(shelter)
        return shelter

    @staticmethod
    def save(shelter):
        db.session.add(shelter)
        db.session.commit()
        return shelter

    @staticmethod
    def delete(shelter):
        db.session.delete(shelter)
        db.session.commit()
