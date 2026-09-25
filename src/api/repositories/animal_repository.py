from api.models import AddoptionRequest, Animal, Shelter, db
from sqlalchemy.orm import selectinload

# FILTROS ADMITIDOS PARA EL REPOSITORIO ANIMAL
# TIPO LIKE X
LIKE_FILTER_FIELDS = {
    "animal_id", "name", "breed", "size", "activity_level", "story"
}

# TIPO IGUALDAD
EQUAL_FILTER_FIELDS = {"animal_type_id", "shelter_id", "status"}
JOIN_FILTER_FIELDS = {"shelter_type_id"}
FILTERABLE_FIELDS = LIKE_FILTER_FIELDS | EQUAL_FILTER_FIELDS | JOIN_FILTER_FIELDS

# CAMPOS ORDENABLES
SORTABLE_FIELDS = {
    "id", "animal_id", "name", "breed", "size", "weight", "birthdate",
    "animal_type_id", "shelter_id", "status", "created_at", "update_at"
}


def _esta_adoptado():
    return (
        db.select(AddoptionRequest.id)
        .where(AddoptionRequest.animal_id == Animal.id)
        .where(AddoptionRequest.status == "aceptada")
        .exists()
    )


class AnimalRepository:

    @staticmethod
    def get_by_id(id_):
        return db.session.get(Animal, id_)

    @staticmethod
    def get_by_animal_id(animal_id):
        return db.session.scalars(
            db.select(Animal).where(Animal.animal_id == animal_id)
        ).one_or_none()

    @staticmethod
    def list_all(filters=None, sort_by=None, dir='asc', page=1, per_page=10, birthdate_from=None, birthdate_to=None, hide_adopted=False):
        query = db.select(Animal).options(
            selectinload(Animal.animal_type),
            selectinload(Animal.shelter),
            selectinload(Animal.media),
        )

        for field, value in (filters or {}).items():
            if value in (None, ''):
                continue
            if field == "shelter_type_id":
                query = query.join(Shelter, Animal.shelter_id == Shelter.id).where(Shelter.shelter_type_id == value)
                continue
            column = getattr(Animal, field)
            if isinstance(value, (list, tuple, set)):
                query = query.where(column.in_(value))
            elif field in LIKE_FILTER_FIELDS:
                query = query.where(column.ilike(f"%{value}%"))
            elif field in EQUAL_FILTER_FIELDS:
                query = query.where(column == value)

        if birthdate_from is not None:
            query = query.where(Animal.birthdate > birthdate_from)
        if birthdate_to is not None:
            query = query.where(Animal.birthdate <= birthdate_to)
        if hide_adopted:
            query = query.where(~_esta_adoptado())

        if sort_by in SORTABLE_FIELDS:
            column = getattr(Animal, sort_by)
            query = query.order_by(
                column.desc() if dir == 'desc' else column.asc(),
                Animal.id.desc() if dir == 'desc' else Animal.id.asc(),
            )

        return db.paginate(query, page=page, per_page=per_page, error_out=False)

    @staticmethod
    def create(**fields):
        animal = Animal(**fields)
        db.session.add(animal)
        return animal

    @staticmethod
    def save(animal):
        db.session.add(animal)
        db.session.commit()
        return animal

    @staticmethod
    def delete(animal):
        db.session.delete(animal)
        db.session.commit()
