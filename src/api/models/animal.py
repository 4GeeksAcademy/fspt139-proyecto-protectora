from datetime import date, datetime
from typing import List, Optional

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from . import db


class Animal(db.Model):
    __tablename__ = 'animal'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    animal_id: Mapped[str] = mapped_column(String, unique=True)
    name: Mapped[str] = mapped_column(String)
    sex: Mapped[Optional[str]] = mapped_column(String)
    breed: Mapped[str] = mapped_column(String)
    size: Mapped[str] = mapped_column(String)
    weight: Mapped[Optional[float]] = mapped_column(Numeric(10, 2), default=0.0)
    birthdate: Mapped[Optional[date]] = mapped_column(Date)
    activity_level: Mapped[Optional[str]] = mapped_column(String)
    vaccines: Mapped[Optional[str]] = mapped_column(String)
    has_microchip: Mapped[Optional[bool]] = mapped_column(Boolean, default=False)
    is_sterilized: Mapped[Optional[bool]] = mapped_column(Boolean, default=False)
    tests_done: Mapped[Optional[str]] = mapped_column(String)
    special_needs: Mapped[Optional[str]] = mapped_column(Text)
    traits: Mapped[Optional[str]] = mapped_column(Text)
    lives_with_kids: Mapped[Optional[bool]] = mapped_column(Boolean)
    lives_with_dogs: Mapped[Optional[bool]] = mapped_column(Boolean)
    lives_with_cats: Mapped[Optional[bool]] = mapped_column(Boolean)
    ideal_home: Mapped[Optional[str]] = mapped_column(Text)
    story: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String, default='activado')
    animal_type_id: Mapped[int] = mapped_column(ForeignKey('animal_type.id'))
    shelter_id: Mapped[Optional[int]] = mapped_column(ForeignKey('shelter.id', ondelete='SET NULL'))
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=func.now())
    update_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=func.now(), onupdate=func.now())

    animal_type: Mapped["AnimalType"] = relationship(back_populates="animals")
    shelter: Mapped[Optional["Shelter"]] = relationship(back_populates="animals")
    media: Mapped[List["AnimalMedia"]] = relationship(back_populates="animal", passive_deletes=True)
    requests: Mapped[List["Request"]] = relationship(back_populates="animal", passive_deletes=True)
    adoption_requests: Mapped[List["AddoptionRequest"]] = relationship(back_populates="animal", passive_deletes=True)
    addoption_processes: Mapped[List["AddoptionProcess"]] = relationship(back_populates="animal", passive_deletes=True)

    NECESIDADES_PUBLIC_STATUSES = {"abierta", "cerrada"}

    def serialize(self):
        # no me gusta demasiado, idealmente deberíamos sacarlo de un service pero por prisa lo meto aqui,
        # todo: crear animal_serialize propio en el service y ahí meter esta logica
        # estados de necesidad visibles en el frontend publico (PASAR tmb el NECESIDADES_PUBLIC_STATUSES)

        last_process = max(self.addoption_processes, key=lambda p: p.created_at or datetime.min, default=None)
        necesidades_visibles = [r for r in self.requests if r.status in self.NECESIDADES_PUBLIC_STATUSES]

        return {
            "id": self.id,
            "animal_id": self.animal_id,
            "name": self.name,
            "sex": self.sex,
            "breed": self.breed,
            "size": self.size,
            "weight": self.weight,
            "birthdate": self.birthdate.isoformat() if self.birthdate else None,
            "activity_level": self.activity_level,
            "vaccines": self.vaccines,
            "has_microchip": self.has_microchip,
            "is_sterilized": self.is_sterilized,
            "tests_done": self.tests_done,
            "special_needs": self.special_needs,
            "traits": self.traits,
            "lives_with_kids": self.lives_with_kids,
            "lives_with_dogs": self.lives_with_dogs,
            "lives_with_cats": self.lives_with_cats,
            "ideal_home": self.ideal_home,
            "story": self.story,
            "status": self.status,
            "animal_type_id": self.animal_type_id,
            "species": self.animal_type.species if self.animal_type else None,
            "shelter_id": self.shelter.shelter_id if self.shelter else None,
            "shelter_name": self.shelter.name if self.shelter else None,
            "logo_url": self.shelter.logo_url if self.shelter else None,
            "map_positioning": self.shelter.map_positioning if self.shelter else None,
            "media": [media.serialize() for media in self.media],
            "cover_image": next((media.url for media in self.media if media.is_cover), None),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "update_at": self.update_at.isoformat() if self.update_at else None,
            "addoption_requests_count": len(self.adoption_requests),
             "is_adopted": any(request.status == "aceptada" for request in self.adoption_requests),
            "addoption_process_id": last_process.addoption_process_id if last_process else None,
            "animal_request_ids": [request.request_id for request in self.requests],
            "necesidades": [necesidad.serialize() for necesidad in necesidades_visibles],
        }
