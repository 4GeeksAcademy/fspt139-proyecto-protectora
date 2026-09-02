from datetime import date, datetime
from typing import List, Optional

from sqlalchemy import Date, DateTime, Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from . import db


class Animal(db.Model):
    __tablename__ = 'animal'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    animal_id: Mapped[str] = mapped_column(String, unique=True)
    name: Mapped[str] = mapped_column(String)
    breed: Mapped[str] = mapped_column(String)
    size: Mapped[str] = mapped_column(String)
    weight: Mapped[Optional[float]] = mapped_column(Float(10, 2), default=0.0)
    birthdate: Mapped[Optional[date]] = mapped_column(Date)
    activity_level: Mapped[Optional[str]] = mapped_column(String)
    story: Mapped[str] = mapped_column(Text)
    animal_type_id: Mapped[int] = mapped_column(ForeignKey('animal_type.id'))
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=func.now())
    update_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime, default=func.now(), onupdate=func.now())

    animal_type: Mapped["AnimalType"] = relationship(back_populates="animals")
    media: Mapped[List["AnimalMedia"]] = relationship(back_populates="animal")
    requests: Mapped[List["Request"]] = relationship(back_populates="animal")
    adoption_requests: Mapped[List["AddoptionRequest"]] = relationship(back_populates="animal")

    def serialize(self):
        return {
            "id": self.id,
            "animal_id": self.animal_id,
            "name": self.name,
            "breed": self.breed,
            "size": self.size,
            "weight": self.weight,
            "birthdate": self.birthdate.isoformat() if self.birthdate else None,
            "activity_level": self.activity_level,
            "story": self.story,
            "animal_type_id": self.animal_type_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "update_at": self.update_at.isoformat() if self.update_at else None,
        }
