from api.models import RequestMedia, db


class RequestMediaRepository:

    @staticmethod
    def get_by_id(id_):
        return db.session.get(RequestMedia, id_)

    @staticmethod
    def get_by_media_id(media_id):
        return db.session.scalars(db.select(RequestMedia).where(RequestMedia.media_id == media_id)).one_or_none()

    @staticmethod
    def list_all():
        return db.session.scalars(db.select(RequestMedia)).all()

    @staticmethod
    def list_by_request_id(request_id):
        return db.session.scalars(db.select(RequestMedia).where(RequestMedia.request_id == request_id)).all()

    @staticmethod
    def clear_cover(request_id):
        for media in RequestMediaRepository.list_by_request_id(request_id):
            if media.is_cover:
                media.is_cover = False

    @staticmethod
    def create(**fields):
        request_media = RequestMedia(**fields)
        db.session.add(request_media)
        return request_media

    @staticmethod
    def save(request_media):
        db.session.add(request_media)
        db.session.commit()
        return request_media

    @staticmethod
    def delete(request_media):
        db.session.delete(request_media)
        db.session.commit()
