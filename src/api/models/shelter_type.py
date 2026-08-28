from typing import List

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from . import db


class ShelterType(db.Model):
    __tablename__ = 'shelter_type'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    shelter_type_id: Mapped[str] = mapped_column(String, unique=True)
    name: Mapped[str] = mapped_column(String)

    shelters: Mapped[List["Shelter"]] = relationship(back_populates="shelter_type")

    def serialize(self):
        return {
            "id": self.id,
            "shelter_type_id": self.shelter_type_id,
            "name": self.name,
        }
