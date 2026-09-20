from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from . import db


class AddoptionRequestAnswer(db.Model):
    __tablename__ = 'addoption_request_answer'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    addoption_request_answer_id: Mapped[str] = mapped_column(String, unique=True)
    addoption_request_id: Mapped[int] = mapped_column(ForeignKey('addoption_request.id', ondelete='CASCADE'))

    question: Mapped[str] = mapped_column(Text) # copiada al crear la respuesta
    answer: Mapped[str] = mapped_column(Text)

    position: Mapped[int] = mapped_column(default=0)
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=func.now())
    update_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=func.now(), onupdate=func.now())

    addoption_request: Mapped["AddoptionRequest"] = relationship(back_populates="answers")

    def serialize(self):
        return {
            "id": self.id,
            "addoption_request_answer_id": self.addoption_request_answer_id,
            "addoption_request_id": self.addoption_request_id,
            "question": self.question,
            "answer": self.answer,
            "position": self.position,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "update_at": self.update_at.isoformat() if self.update_at else None,
        }
