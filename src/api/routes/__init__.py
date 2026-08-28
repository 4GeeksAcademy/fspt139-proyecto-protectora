"""
This package holds the API blueprint plus one module per route context
(hello, seed, shelters, animals, ...). Each module imports `api` from here
and registers its own endpoints on it with `@api.route(...)`. This file
discovers every module in the folder and imports it automatically, so
adding a new route context only means dropping a new file here instead of
growing a single routes.py forever.
"""
import importlib
import pkgutil

from flask import Blueprint
from flask_cors import CORS

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)

# Import every sibling module so their @api.route(...) decorators run and
# register their endpoints on the blueprint above.
for _, module_name, _ in pkgutil.iter_modules(__path__):
    importlib.import_module(f"{__name__}.{module_name}")
