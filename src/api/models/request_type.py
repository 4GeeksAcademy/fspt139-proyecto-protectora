from typing import List, Optional

from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from . import db


class RequestType(db.Model):
    __tablename__ = 'request_type'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    request_type_id: Mapped[str] = mapped_column(String, unique=True)
    code: Mapped[str] = mapped_column(String, unique=True)
    name: Mapped[str] = mapped_column(String)
    description: Mapped[Optional[str]] = mapped_column(Text)

    requests: Mapped[List["Request"]] = relationship(back_populates="request_type")

    def serialize(self):
        return {
            "id": self.id,
            "request_type_id": self.request_type_id,
            "code": self.code,
            "name": self.name,
            "description": self.description,
        }
