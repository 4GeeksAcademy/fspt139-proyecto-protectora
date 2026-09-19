from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from . import db


class AnimalTypeRequirement(db.Model):
    __tablename__ = 'animal_type_requirement'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    animal_type_requirement_id: Mapped[str] = mapped_column(String, unique=True)
    animal_type_id: Mapped[int] = mapped_column(ForeignKey('animal_type.id', ondelete='CASCADE'))

    label: Mapped[str] = mapped_column(String)
    is_checked_by_default: Mapped[bool] = mapped_column(Boolean, default=False)
    position: Mapped[int] = mapped_column(default=0)


    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=func.now())
    update_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=func.now(), onupdate=func.now())

    animal_type: Mapped["AnimalType"] = relationship(back_populates="requirements")

    def serialize(self):
        return {
            "id": self.id,
            "animal_type_requirement_id": self.animal_type_requirement_id,
            "animal_type_id": self.animal_type_id,
            "label": self.label,
            "is_checked_by_default": self.is_checked_by_default,
            "position": self.position,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "update_at": self.update_at.isoformat() if self.update_at else None,
        }
