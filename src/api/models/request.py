from datetime import datetime
from typing import List, Optional

from sqlalchemy import DateTime, Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from . import db


class Request(db.Model):
    __tablename__ = 'request'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    request_id: Mapped[str] = mapped_column(String, unique=True)
    shelter_id: Mapped[Optional[int]] = mapped_column(ForeignKey('shelter.id'))
    animal_id: Mapped[Optional[int]] = mapped_column(ForeignKey('animal.id'))
    name: Mapped[str] = mapped_column(String)
    description: Mapped[str] = mapped_column(Text)
    request_deadline: Mapped[Optional[datetime]] = mapped_column(DateTime)
    amount_needed: Mapped[Optional[float]] = mapped_column(Float(10, 2), default=0.0)
    request_type: Mapped[str] = mapped_column(String)
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=func.now())
    update_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime, default=func.now(), onupdate=func.now())

    shelter: Mapped[Optional["Shelter"]] = relationship(back_populates="requests")
    animal: Mapped[Optional["Animal"]] = relationship(back_populates="requests")
    user_requests: Mapped[List["UserRequest"]] = relationship(back_populates="request")

    def serialize(self):
        return {
            "id": self.id,
            "request_id": self.request_id,
            "shelter_id": self.shelter_id,
            "animal_id": self.animal_id,
            "name": self.name,
            "description": self.description,
            "request_deadline": self.request_deadline.isoformat() if self.request_deadline else None,
            "amount_needed": self.amount_needed,
            "request_type": self.request_type,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "update_at": self.update_at.isoformat() if self.update_at else None,
        }
