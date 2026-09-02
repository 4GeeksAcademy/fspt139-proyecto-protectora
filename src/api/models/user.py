from datetime import datetime
from typing import List, Optional

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from . import db


class User(db.Model):
    __tablename__ = 'user'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String, unique=True)
    name: Mapped[str] = mapped_column(String)
    last_name1: Mapped[str] = mapped_column(String)
    last_name2: Mapped[Optional[str]] = mapped_column(String)
    phone: Mapped[str] = mapped_column(String)
    email: Mapped[str] = mapped_column(String, unique=True)
    password: Mapped[str] = mapped_column(String)
    token_version: Mapped[Optional[int]] = mapped_column()
    rol: Mapped[str] = mapped_column(String)
    shelter_id: Mapped[Optional[int]] = mapped_column(ForeignKey('shelter.id'))
    ranking: Mapped[Optional[int]] = mapped_column(default=0)
    address: Mapped[Optional[str]] = mapped_column(String)
    map_positioning: Mapped[Optional[str]] = mapped_column(String)
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=func.now())
    update_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime, default=func.now(), onupdate=func.now())

    shelter: Mapped[Optional["Shelter"]] = relationship(back_populates="users")
    reviews: Mapped[List["UserReview"]] = relationship(back_populates="user")
    adoption_requests: Mapped[List["AddoptionRequest"]] = relationship(back_populates="user")
    user_requests: Mapped[List["UserRequest"]] = relationship(back_populates="user")

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "name": self.name,
            "last_name1": self.last_name1,
            "last_name2": self.last_name2,
            "phone": self.phone,
            "email": self.email,
            "rol": self.rol,
            "shelter_id": self.shelter_id,
            "ranking": self.ranking,
            "address": self.address,
            "map_positioning": self.map_positioning,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "update_at": self.update_at.isoformat() if self.update_at else None,
        }
