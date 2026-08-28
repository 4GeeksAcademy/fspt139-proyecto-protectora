from api.models import UserReview, db


class UserReviewRepository:

    @staticmethod
    def get_by_id(id_):
        return db.session.get(UserReview, id_)

    @staticmethod
    def get_by_review_id(review_id):
        return db.session.scalars(
            db.select(UserReview).where(UserReview.review_id == review_id)
        ).one_or_none()

    @staticmethod
    def list_all():
        return db.session.scalars(db.select(UserReview)).all()

    @staticmethod
    def create(**fields):
        user_review = UserReview(**fields)
        db.session.add(user_review)
        return user_review

    @staticmethod
    def save(user_review):
        db.session.add(user_review)
        db.session.commit()
        return user_review

    @staticmethod
    def delete(user_review):
        db.session.delete(user_review)
        db.session.commit()
