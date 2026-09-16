#todo: reemplazar la mayoria por Cloudinary

import os
import uuid

from werkzeug.utils import secure_filename

from api.repositories.animal_media_repository import AnimalMediaRepository
from api.repositories.animal_repository import AnimalRepository
from api.utils import APIException

UPLOAD_ROOT = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads", "animals")

MAX_IMAGE_BYTES = 10 * 1024 * 1024
MAX_VIDEO_BYTES = 50 * 1024 * 1024

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png"}
ALLOWED_VIDEO_TYPES = {"video/mp4", "video/quicktime"}


def _get_owned_animal(animal_id, shelter_id):
    animal = AnimalRepository.get_by_animal_id(animal_id)
    if animal is None:
        raise APIException("Animal no encontrado", status_code=404)
    if animal.shelter_id != shelter_id:
        raise APIException("No tienes permiso para modificar este animal", status_code=403)
    return animal


def add_animal_media(animal_id, shelter_id, file, is_cover=False):
    animal = _get_owned_animal(animal_id, shelter_id)

    if file is None or not file.filename:
        raise APIException("No se ha recibido ningún archivo", status_code=400)

    content_type = file.mimetype
    if content_type in ALLOWED_IMAGE_TYPES:
        media_format = "image"
        max_bytes = MAX_IMAGE_BYTES
    elif content_type in ALLOWED_VIDEO_TYPES:
        media_format = "video"
        max_bytes = MAX_VIDEO_BYTES
    else:
        raise APIException("Formato de archivo no admitido", status_code=400)

    file.stream.seek(0, os.SEEK_END)
    size = file.stream.tell()
    file.stream.seek(0)
    if size > max_bytes:
        raise APIException("El archivo supera el tamaño máximo permitido", status_code=400)

    animal_dir = os.path.join(UPLOAD_ROOT, animal.animal_id)
    os.makedirs(animal_dir, exist_ok=True)

    media_id = str(uuid.uuid4())
    extension = os.path.splitext(secure_filename(file.filename))[1].lower()
    stored_name = f"{media_id}{extension}"
    file.save(os.path.join(animal_dir, stored_name))

    if is_cover:
        AnimalMediaRepository.clear_cover(animal.id)

    media = AnimalMediaRepository.create(
        media_id=media_id,
        animal_id=animal.id,
        format=media_format,
        url=f"/api/uploads/animals/{animal.animal_id}/{stored_name}",
        is_cover=bool(is_cover),
    )
    return AnimalMediaRepository.save(media)


def delete_animal_media(animal_id, media_id, shelter_id):
    animal = _get_owned_animal(animal_id, shelter_id)

    media = AnimalMediaRepository.get_by_media_id(media_id)
    if media is None or media.animal_id != animal.id:
        raise APIException("Recurso no encontrado", status_code=404)

    file_path = os.path.join(UPLOAD_ROOT, animal.animal_id, os.path.basename(media.url))
    if os.path.isfile(file_path):
        try:
            os.remove(file_path)
        except OSError:
            pass

    AnimalMediaRepository.delete(media)


def set_animal_media_cover(animal_id, media_id, shelter_id):
    animal = _get_owned_animal(animal_id, shelter_id)

    media = AnimalMediaRepository.get_by_media_id(media_id)
    if media is None or media.animal_id != animal.id:
        raise APIException("Recurso no encontrado", status_code=404)

    AnimalMediaRepository.clear_cover(animal.id)
    media.is_cover = True
    return AnimalMediaRepository.save(media)
