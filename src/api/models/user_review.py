from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from . import db


class UserReview(db.Model):
    __tablename__ = 'user_review'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('user.id'))
    review_id: Mapped[str] = mapped_column(String, unique=True)
    ranking: Mapped[Optional[int]] = mapped_column(default=1)
    review: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=func.now())
    update_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime, default=func.now(), onupdate=func.now())

    user: Mapped["User"] = relationship(back_populates="reviews")

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "review_id": self.review_id,
            "ranking": self.ranking,
            "review": self.review,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "update_at": self.update_at.isoformat() if self.update_at else None,
        }
