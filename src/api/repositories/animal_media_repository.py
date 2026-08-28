from api.models import AnimalMedia, db


class AnimalMediaRepository:

    @staticmethod
    def get_by_id(id_):
        return db.session.get(AnimalMedia, id_)

    @staticmethod
    def get_by_media_id(media_id):
        return db.session.scalars(
            db.select(AnimalMedia).where(AnimalMedia.media_id == media_id)
        ).one_or_none()

    @staticmethod
    def list_all():
        return db.session.scalars(db.select(AnimalMedia)).all()

    @staticmethod
    def create(**fields):
        animal_media = AnimalMedia(**fields)
        db.session.add(animal_media)
        return animal_media

    @staticmethod
    def save(animal_media):
        db.session.add(animal_media)
        db.session.commit()
        return animal_media

    @staticmethod
    def delete(animal_media):
        db.session.delete(animal_media)
        db.session.commit()
