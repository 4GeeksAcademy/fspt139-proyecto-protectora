from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from . import db


class AddoptionRequest(db.Model):
    __tablename__ = 'addoption_request'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    addoption_request_id: Mapped[str] = mapped_column(String, unique=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('user.id'))
    animal_id: Mapped[int] = mapped_column(ForeignKey('animal.id'))
    score: Mapped[Optional[int]] = mapped_column(default=0)
    is_accepted: Mapped[bool] = mapped_column(Boolean)
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=func.now())
    update_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime, default=func.now(), onupdate=func.now())

    user: Mapped["User"] = relationship(back_populates="adoption_requests")
    animal: Mapped["Animal"] = relationship(back_populates="adoption_requests")

    def serialize(self):
        return {
            "id": self.id,
            "addoption_request_id": self.addoption_request_id,
            "user_id": self.user_id,
            "animal_id": self.animal_id,
            "score": self.score,
            "is_accepted": self.is_accepted,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "update_at": self.update_at.isoformat() if self.update_at else None,
        }
