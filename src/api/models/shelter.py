from datetime import datetime
from typing import List, Optional

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from . import db


class Shelter(db.Model):
    __tablename__ = 'shelter'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    shelter_id: Mapped[str] = mapped_column(String, unique=True)
    name: Mapped[str] = mapped_column(String)
    description: Mapped[Optional[str]] = mapped_column(Text)
    logo_url: Mapped[Optional[str]] = mapped_column(String)
    email: Mapped[str] = mapped_column(String)
    phone: Mapped[str] = mapped_column(String)
    website: Mapped[Optional[str]] = mapped_column(String)
    instagram: Mapped[Optional[str]] = mapped_column(String)
    address: Mapped[Optional[str]] = mapped_column(String)
    map_positioning: Mapped[Optional[str]] = mapped_column(String)
    shelter_type_id: Mapped[int] = mapped_column(ForeignKey('shelter_type.id'))
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=func.now())
    update_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime, default=func.now(), onupdate=datetime.utcnow)

    shelter_type: Mapped["ShelterType"] = relationship(back_populates="shelters")
    users: Mapped[List["User"]] = relationship(back_populates="shelter")
    requests: Mapped[List["Request"]] = relationship(back_populates="shelter")

    def serialize(self):
        return {
            "id": self.id,
            "shelter_id": self.shelter_id,
            "name": self.name,
            "description": self.description,
            "logo_url": self.logo_url,
            "email": self.email,
            "phone": self.phone,
            "website": self.website,
            "instagram": self.instagram,
            "address": self.address,
            "map_positioning": self.map_positioning,
            "shelter_type_id": self.shelter_type_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "update_at": self.update_at.isoformat() if self.update_at else None,
        }
