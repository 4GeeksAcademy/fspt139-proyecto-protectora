#todo: reemplazar la mayoria por Cloudinary y mirar si se puede combinar con animal_media_service (COPIA PEGA DE ANTERIOR COMMIT animal_media_service)

import os
import uuid

from werkzeug.utils import secure_filename

from api.repositories.request_media_repository import RequestMediaRepository
from api.repositories.request_repository import RequestRepository
from api.utils import APIException

UPLOAD_ROOT = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads", "requests")

MAX_IMAGE_BYTES = 10 * 1024 * 1024
MAX_VIDEO_BYTES = 50 * 1024 * 1024

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png"}
ALLOWED_VIDEO_TYPES = {"video/mp4", "video/quicktime"}


def _get_owned_necesidad(request_id, shelter_id):
    necesidad = RequestRepository.get_by_request_id(request_id)
    if necesidad is None:
        raise APIException("Necesidad no encontrada", status_code=404)
    if necesidad.shelter_id != shelter_id:
        raise APIException("No tienes permiso para modificar esta necesidad", status_code=403)
    return necesidad


def add_necesidad_media(request_id, shelter_id, file, is_cover=False):
    necesidad = _get_owned_necesidad(request_id, shelter_id)

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

    necesidad_dir = os.path.join(UPLOAD_ROOT, necesidad.request_id)
    os.makedirs(necesidad_dir, exist_ok=True)

    media_id = str(uuid.uuid4())
    extension = os.path.splitext(secure_filename(file.filename))[1].lower()
    stored_name = f"{media_id}{extension}"
    file.save(os.path.join(necesidad_dir, stored_name))

    if is_cover:
        RequestMediaRepository.clear_cover(necesidad.id)

    media = RequestMediaRepository.create(
        media_id=media_id,
        request_id=necesidad.id,
        format=media_format,
        url=f"/api/uploads/requests/{necesidad.request_id}/{stored_name}",
        is_cover=bool(is_cover),
    )
    return RequestMediaRepository.save(media)


def delete_necesidad_media(request_id, media_id, shelter_id):
    necesidad = _get_owned_necesidad(request_id, shelter_id)

    media = RequestMediaRepository.get_by_media_id(media_id)
    if media is None or media.request_id != necesidad.id:
        raise APIException("Recurso no encontrado", status_code=404)

    file_path = os.path.join(UPLOAD_ROOT, necesidad.request_id, os.path.basename(media.url))
    if os.path.isfile(file_path):
        try:
            os.remove(file_path)
        except OSError:
            pass

    RequestMediaRepository.delete(media)


def set_necesidad_media_cover(request_id, media_id, shelter_id):
    necesidad = _get_owned_necesidad(request_id, shelter_id)

    media = RequestMediaRepository.get_by_media_id(media_id)
    if media is None or media.request_id != necesidad.id:
        raise APIException("Recurso no encontrado", status_code=404)

    RequestMediaRepository.clear_cover(necesidad.id)
    media.is_cover = True
    return RequestMediaRepository.save(media)
