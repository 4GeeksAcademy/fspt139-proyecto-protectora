from sqlalchemy.orm import selectinload

from api.models import Animal, AddoptionProcess, db


class AddoptionProcessRepository:

    @staticmethod
    def get_by_id(id_):
        return db.session.get(AddoptionProcess, id_)

    @staticmethod
    def get_by_addoption_process_id(addoption_process_id):
        return db.session.scalars(
            db.select(AddoptionProcess).where(
                AddoptionProcess.addoption_process_id == addoption_process_id)
        ).one_or_none()

    @staticmethod
    def get_by_animal_id(animal_id):
        return db.session.scalars(
            db.select(AddoptionProcess).where(AddoptionProcess.animal_id == animal_id)
        ).one_or_none()

    # listado de la protectora para el panel: un proceso es 1:1 con su animal, asi que
    # "agrupado por animal" ya sale solo con listar los procesos de esa protectora
    @staticmethod
    def list_by_shelter(shelter_id, filters=None, dir='desc', page=1, per_page=12):
        query = db.select(AddoptionProcess).where(AddoptionProcess.shelter_id == shelter_id).options(
            selectinload(AddoptionProcess.animal).selectinload(Animal.media),
            selectinload(AddoptionProcess.addoption_requests),
        )

        status = (filters or {}).get("status")
        if status:
            query = query.where(AddoptionProcess.status == status)

        search = (filters or {}).get("search")
        if search:
            query = query.join(Animal, AddoptionProcess.animal_id == Animal.id).where(
                Animal.name.ilike(f"%{search}%"))

        query = query.order_by(
            AddoptionProcess.update_at.desc() if dir == 'desc' else AddoptionProcess.update_at.asc())

        return db.paginate(query, page=page, per_page=per_page, error_out=False)

    @staticmethod
    def create(**fields):
        addoption_process = AddoptionProcess(**fields)
        db.session.add(addoption_process)
        return addoption_process

    @staticmethod
    def save(addoption_process):
        db.session.add(addoption_process)
        db.session.commit()
        return addoption_process

    @staticmethod
    def delete(addoption_process):
        db.session.delete(addoption_process)
        db.session.commit()
