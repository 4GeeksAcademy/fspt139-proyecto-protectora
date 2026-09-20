from datetime import datetime
from typing import List, Optional

from sqlalchemy import DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from . import db


class Request(db.Model):
    __tablename__ = 'request'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    request_id: Mapped[str] = mapped_column(String, unique=True)
    shelter_id: Mapped[Optional[int]] = mapped_column(ForeignKey('shelter.id', ondelete='SET NULL'))
    animal_id: Mapped[Optional[int]] = mapped_column(ForeignKey('animal.id', ondelete='SET NULL'))
    name: Mapped[str] = mapped_column(String)
    description: Mapped[str] = mapped_column(Text)
    request_deadline: Mapped[Optional[datetime]] = mapped_column(DateTime)
    amount_needed: Mapped[Optional[float]] = mapped_column(Numeric(10, 2), default=0.0)
    unit: Mapped[Optional[str]] = mapped_column(String)
    footnote: Mapped[Optional[str]] = mapped_column(String)
    status: Mapped[str] = mapped_column(String, default='abierta')
    request_type_id: Mapped[int] = mapped_column(ForeignKey('request_type.id'))
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=func.now())
    update_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime, default=func.now(), onupdate=func.now())

    shelter: Mapped[Optional["Shelter"]] = relationship(back_populates="requests")
    animal: Mapped[Optional["Animal"]] = relationship(back_populates="requests")
    user_requests: Mapped[List["UserRequest"]] = relationship(back_populates="request", passive_deletes=True)
    request_type: Mapped["RequestType"] = relationship(back_populates="requests")
    media: Mapped[List["RequestMedia"]] = relationship(back_populates="request", passive_deletes=True)

    def serialize(self):
        colaboraciones = self.user_requests or []

        return {
            "id": self.id,
            "request_id": self.request_id,
            "shelter_id": self.shelter_id,
            "animal_id": self.animal_id,
            "name": self.name,
            "description": self.description,
            "request_deadline": self.request_deadline.isoformat() if self.request_deadline else None,
            "amount_needed": self.amount_needed,
            "amount_current": float(sum(c.amount or 0 for c in colaboraciones)),
            "collaborators": len({c.user_id for c in colaboraciones}),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "update_at": self.update_at.isoformat() if self.update_at else None,
            "unit": self.unit,
            "footnote": self.footnote,
            "shelter_name": self.shelter.name if self.shelter else None,
            "status": self.status,
            "request_type_id": self.request_type.id,
            "request_type_code": self.request_type.code,
            "request_type_name": self.request_type.name,
            "media": [media.serialize() for media in self.media],
            "cover_image": next((media.url for media in self.media if media.is_cover), None),
        }
