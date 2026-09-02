from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from . import db


class UserRequest(db.Model):
    __tablename__ = 'user_request'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('user.id'))
    request_id: Mapped[int] = mapped_column(ForeignKey('request.id'))
    user_request_id: Mapped[str] = mapped_column(String, unique=True)
    amount: Mapped[Optional[float]] = mapped_column(Float(10, 2), default=0.0)
    shelter_answer: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=func.now())
    update_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime, default=func.now(), onupdate=func.now())

    user: Mapped["User"] = relationship(back_populates="user_requests")
    request: Mapped["Request"] = relationship(back_populates="user_requests")

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "request_id": self.request_id,
            "user_request_id": self.user_request_id,
            "amount": self.amount,
            "shelter_answer": self.shelter_answer,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "update_at": self.update_at.isoformat() if self.update_at else None,
        }
