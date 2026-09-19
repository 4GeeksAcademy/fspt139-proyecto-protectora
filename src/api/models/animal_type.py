from typing import List

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from . import db


class AnimalType(db.Model):
    __tablename__ = 'animal_type'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    animal_type_id: Mapped[str] = mapped_column(String, unique=True)
    species: Mapped[str] = mapped_column()

    animals: Mapped[List["Animal"]] = relationship(back_populates="animal_type")
    requirements: Mapped[List["AnimalTypeRequirement"]] = relationship(back_populates="animal_type", passive_deletes=True)

    def serialize(self):
        return {
            "id": self.id,
            "animal_type_id": self.animal_type_id,
            "species": self.species,
            "requirements": [r.serialize() for r in sorted(self.requirements, key=lambda r: r.position)],
        }
