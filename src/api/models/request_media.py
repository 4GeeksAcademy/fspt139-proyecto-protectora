from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from . import db


class RequestMedia(db.Model):
    __tablename__ = 'request_media'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    media_id: Mapped[str] = mapped_column(String, unique=True)
    request_id: Mapped[int] = mapped_column(ForeignKey('request.id', ondelete='CASCADE'))
    format: Mapped[str] = mapped_column(String)
    url: Mapped[str] = mapped_column(String)
    is_cover: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=func.now())
    update_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=func.now(), onupdate=func.now())

    request: Mapped["Request"] = relationship(back_populates="media")

    def serialize(self):
        return {
            "id": self.id,
            "media_id": self.media_id,
            "request_id": self.request_id,
            "format": self.format,
            "url": self.url,
            "is_cover": self.is_cover,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "update_at": self.update_at.isoformat() if self.update_at else None,
        }
