#todo: reemplazar la mayoria por Cloudinary

import os
import uuid

from werkzeug.utils import secure_filename

from api.repositories.shelter_repository import ShelterRepository
from api.utils import APIException

UPLOAD_ROOT = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads", "shelters")

MAX_IMAGE_BYTES = 10 * 1024 * 1024

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png"}


def _get_owned_shelter(shelter_pk):
    shelter = ShelterRepository.get_by_id(shelter_pk)
    if shelter is None:
        raise APIException("Protectora no encontrada", status_code=404)
    return shelter


def _borrar_logo_actual(shelter):
    if not shelter.logo_url:
        return

    file_path = os.path.join(UPLOAD_ROOT, shelter.shelter_id, os.path.basename(shelter.logo_url))
    if os.path.isfile(file_path):
        try:
            os.remove(file_path)
        except OSError:
            pass


def add_shelter_logo(shelter_pk, file):
    shelter = _get_owned_shelter(shelter_pk)

    if file is None or not file.filename:
        raise APIException("No se ha recibido ningún archivo", status_code=400)

    if file.mimetype not in ALLOWED_IMAGE_TYPES:
        raise APIException("Formato de archivo no admitido", status_code=400)

    file.stream.seek(0, os.SEEK_END)
    size = file.stream.tell()
    file.stream.seek(0)
    if size > MAX_IMAGE_BYTES:
        raise APIException("El archivo supera el tamaño máximo permitido", status_code=400)

    shelter_dir = os.path.join(UPLOAD_ROOT, shelter.shelter_id)
    os.makedirs(shelter_dir, exist_ok=True)

    _borrar_logo_actual(shelter)

    extension = os.path.splitext(secure_filename(file.filename))[1].lower()
    stored_name = f"{uuid.uuid4()}{extension}"
    file.save(os.path.join(shelter_dir, stored_name))

    shelter.logo_url = f"/api/uploads/shelters/{shelter.shelter_id}/{stored_name}"
    return ShelterRepository.save(shelter)


def delete_shelter_logo(shelter_pk):
    shelter = _get_owned_shelter(shelter_pk)

    _borrar_logo_actual(shelter)
    shelter.logo_url = None
    return ShelterRepository.save(shelter)
