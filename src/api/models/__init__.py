"""
This package holds the shared `db` (SQLAlchemy) instance plus one module per
entity (shelter_type, shelter, user, ...). Each module defines its model
class against `db.Model`; this file discovers every module in the folder,
imports it, and re-exports its model classes here so callers can keep doing
`from api.models import db, User, Shelter, ...` without knowing which file
each class lives in, and adding a new entity only means dropping a new file
here instead of growing a single models.py forever.
"""
import importlib
import inspect
import pkgutil

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

for _, module_name, _ in pkgutil.iter_modules(__path__):
    module = importlib.import_module(f"{__name__}.{module_name}")
    for name, obj in inspect.getmembers(module):
        if inspect.isclass(obj) and issubclass(obj, db.Model) and obj is not db.Model:
            globals()[name] = obj
