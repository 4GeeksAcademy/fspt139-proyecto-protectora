from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from . import db


class AnimalMedia(db.Model):
    __tablename__ = 'animal_media'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    media_id: Mapped[str] = mapped_column(String, unique=True)
    animal_id: Mapped[int] = mapped_column(ForeignKey('animal.id'))
    format: Mapped[str] = mapped_column(String)
    url: Mapped[str] = mapped_column(String)
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=func.now())
    update_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime, default=func.now(), onupdate=func.now())

    animal: Mapped["Animal"] = relationship(back_populates="media")

    def serialize(self):
        return {
            "id": self.id,
            "media_id": self.media_id,
            "animal_id": self.animal_id,
            "format": self.format,
            "url": self.url,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "update_at": self.update_at.isoformat() if self.update_at else None,
        }
