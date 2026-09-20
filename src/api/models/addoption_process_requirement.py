from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from . import db


class AddoptionProcessRequirement(db.Model):
    __tablename__ = 'addoption_process_requirement'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    addoption_process_requirement_id: Mapped[str] = mapped_column(String, unique=True)
    addoption_process_id: Mapped[int] = mapped_column(ForeignKey('addoption_process.id', ondelete='CASCADE'))
    label: Mapped[str] = mapped_column(String)
    position: Mapped[int] = mapped_column(default=0)
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=func.now())
    update_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=func.now(), onupdate=func.now())

    addoption_process: Mapped["AddoptionProcess"] = relationship(back_populates="requirements")

    def serialize(self):
        return {
            "id": self.id,
            "addoption_process_requirement_id": self.addoption_process_requirement_id,
            "addoption_process_id": self.addoption_process_id,
            "label": self.label,
            "position": self.position,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "update_at": self.update_at.isoformat() if self.update_at else None,
        }
