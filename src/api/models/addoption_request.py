from datetime import datetime
from typing import List, Optional

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from . import db


class AddoptionRequest(db.Model):
    __tablename__ = 'addoption_request'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    addoption_request_id: Mapped[str] = mapped_column(String, unique=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('user.id', ondelete='CASCADE'))
    animal_id: Mapped[int] = mapped_column(ForeignKey('animal.id', ondelete='CASCADE'))
    addoption_process_id: Mapped[Optional[int]] = mapped_column(ForeignKey('addoption_process.id', ondelete='SET NULL'))
    score: Mapped[Optional[int]] = mapped_column(default=0)
    # "pendiente" (recien creada) / "aceptada" (aprobada por la protectora) / "descartada" (rechazada, individual o en bloque)
    status: Mapped[str] = mapped_column(String, default='pendiente')
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=func.now())
    update_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=func.now(), onupdate=func.now())

    user: Mapped["User"] = relationship(back_populates="adoption_requests")
    animal: Mapped["Animal"] = relationship(back_populates="adoption_requests")
    addoption_process: Mapped[Optional["AddoptionProcess"]] = relationship(back_populates="addoption_requests")
    answers: Mapped[List["AddoptionRequestAnswer"]] = relationship(back_populates="addoption_request", passive_deletes=True)

    def serialize(self):
        return {
            "id": self.id,
            "addoption_request_id": self.addoption_request_id,
            "user_id": self.user_id,
            "animal_id": self.animal_id,
            "addoption_process_id": self.addoption_process_id,
            "score": self.score,
            "status": self.status,
            "answers": [answer.serialize() for answer in sorted(self.answers, key=lambda a: a.position)],
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "update_at": self.update_at.isoformat() if self.update_at else None,
        }
