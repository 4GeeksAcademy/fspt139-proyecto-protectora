from datetime import date, datetime
from typing import List, Optional

from sqlalchemy import Date, DateTime, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from . import db


class AddoptionProcess(db.Model):
    __tablename__ = 'addoption_process'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    addoption_process_id: Mapped[str] = mapped_column(String, unique=True)

    animal_id: Mapped[int] = mapped_column(ForeignKey('animal.id', ondelete='CASCADE'))
    shelter_id: Mapped[int] = mapped_column(ForeignKey('shelter.id', ondelete='CASCADE'))

    concurrent_requests_limit: Mapped[Optional[int]] = mapped_column()
    contribution_amount: Mapped[Optional[float]] = mapped_column(Numeric(10, 2))
    start_date: Mapped[Optional[date]] = mapped_column(Date)
    end_date: Mapped[Optional[date]] = mapped_column(Date)
    status: Mapped[str] = mapped_column(String, default='abierto')

    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=func.now())
    update_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=func.now(), onupdate=func.now())

    animal: Mapped["Animal"] = relationship(back_populates="addoption_processes")
    shelter: Mapped["Shelter"] = relationship(back_populates="addoption_processes")
    requirements: Mapped[List["AddoptionProcessRequirement"]] = relationship(back_populates="addoption_process", passive_deletes=True)
    questions: Mapped[List["AddoptionRequestQuestion"]] = relationship(back_populates="addoption_process", passive_deletes=True)
    addoption_requests: Mapped[List["AddoptionRequest"]] = relationship(back_populates="addoption_process", passive_deletes=True)

    def serialize(self):
        return {
            "id": self.id,
            "addoption_process_id": self.addoption_process_id,
            "animal_id": self.animal_id,
            "shelter_id": self.shelter_id,
            "concurrent_requests_limit": self.concurrent_requests_limit,
            "contribution_amount": self.contribution_amount,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "status": self.status,
            "requirements": [r.serialize() for r in sorted(self.requirements, key=lambda r: r.position)],
            "questions": [question.serialize() for question in sorted(self.questions, key=lambda q: q.position)],
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "update_at": self.update_at.isoformat() if self.update_at else None,
        }
