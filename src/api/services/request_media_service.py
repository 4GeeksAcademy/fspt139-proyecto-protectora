import os
import uuid

import cloudinary
import cloudinary.uploader
from cloudinary.exceptions import Error as CloudinaryError
from flask import current_app
from sqlalchemy.exc import SQLAlchemyError

from api.models import db
from api.repositories.request_media_repository import RequestMediaRepository
from api.repositories.request_repository import RequestRepository
from api.utils import APIException


# Se mantiene para los archivos locales anteriores.
UPLOAD_ROOT = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "uploads",
    "requests",
)

MAX_IMAGE_BYTES = 10 * 1024 * 1024
MAX_VIDEO_BYTES = 50 * 1024 * 1024

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png"}
ALLOWED_VIDEO_TYPES = {"video/mp4", "video/quicktime"}


def _configure_cloudinary():
    credentials = {
        "cloud_name": os.getenv("CLOUDINARY_CLOUD_NAME", "").strip(),
        "api_key": os.getenv("CLOUDINARY_API_KEY", "").strip(),
        "api_secret": os.getenv("CLOUDINARY_API_SECRET", "").strip(),
    }

    if not all(credentials.values()):
        raise APIException(
            "Faltan las credenciales de Cloudinary.",
            status_code=503,
        )

    cloudinary.config(**credentials, secure=True)


def _get_owned_necesidad(request_id, shelter_id):
    necesidad = RequestRepository.get_by_request_id(request_id)

    if necesidad is None:
        raise APIException(
            "Necesidad no encontrada",
            status_code=404,
        )

    if necesidad.shelter_id != shelter_id:
        raise APIException(
            "No tienes permiso para modificar esta necesidad",
            status_code=403,
        )

    return necesidad


def _delete_cloudinary_file(public_id, resource_type):
    _configure_cloudinary()

    try:
        result = cloudinary.uploader.destroy(
            public_id,
            resource_type=resource_type,
            invalidate=True,
            timeout=30,
        )

    except CloudinaryError:
        raise APIException(
            "No se pudo eliminar el archivo de Cloudinary.",
            status_code=502,
        ) from None

    # Si ya no existe, podemos eliminar su registro local.
    if result.get("result") not in ("ok", "not found"):
        raise APIException(
            "Cloudinary no confirmó la eliminación del archivo.",
            status_code=502,
        )


def add_necesidad_media(request_id, shelter_id, file, is_cover=False):
    necesidad = _get_owned_necesidad(request_id, shelter_id)

    if file is None or not file.filename:
        raise APIException(
            "No se ha recibido ningún archivo",
            status_code=400,
        )

    if file.mimetype in ALLOWED_IMAGE_TYPES:
        media_format = "image"
        max_bytes = MAX_IMAGE_BYTES
        allowed_formats = ["jpg", "png"]

    elif file.mimetype in ALLOWED_VIDEO_TYPES:
        media_format = "video"
        max_bytes = MAX_VIDEO_BYTES
        allowed_formats = ["mp4", "mov"]

    else:
        raise APIException(
            "Formato de archivo no admitido",
            status_code=400,
        )

    file.stream.seek(0, os.SEEK_END)
    size = file.stream.tell()
    file.stream.seek(0)

    if size == 0:
        raise APIException(
            "El archivo está vacío",
            status_code=400,
        )

    if size > max_bytes:
        raise APIException(
            "El archivo supera el tamaño máximo permitido",
            status_code=400,
        )

    _configure_cloudinary()

    media_id = str(uuid.uuid4())

    try:
        result = cloudinary.uploader.upload(
            file,
            resource_type=media_format,
            public_id=f"requests/{necesidad.request_id}/{media_id}",
            allowed_formats=allowed_formats,
            overwrite=False,
            timeout=60,
        )

    except CloudinaryError:
        raise APIException(
            "No se pudo subir el archivo a Cloudinary.",
            status_code=502,
        ) from None

    try:
        if is_cover:
            RequestMediaRepository.clear_cover(necesidad.id)

        media = RequestMediaRepository.create(
            media_id=media_id,
            request_id=necesidad.id,
            format=media_format,
            url=result["secure_url"],
            is_cover=bool(is_cover),
        )

        media.cloudinary_public_id = result["public_id"]

        return RequestMediaRepository.save(media)

    except SQLAlchemyError:
        db.session.rollback()

        # Si falla la base de datos, intentar retirar el archivo subido.
        try:
            _delete_cloudinary_file(
                result["public_id"],
                media_format,
            )

        except APIException:
            current_app.logger.warning(
                "Archivo de Cloudinary pendiente de limpieza: %s",
                result["public_id"],
            )

        raise APIException(
            "No se pudo guardar el archivo en la base de datos.",
            status_code=500,
        ) from None


def delete_necesidad_media(request_id, media_id, shelter_id):
    necesidad = _get_owned_necesidad(request_id, shelter_id)

    media = RequestMediaRepository.get_by_media_id(media_id)

    if media is None or media.request_id != necesidad.id:
        raise APIException(
            "Recurso no encontrado",
            status_code=404,
        )

    if media.cloudinary_public_id:
        # Archivo guardado en Cloudinary.
        _delete_cloudinary_file(
            media.cloudinary_public_id,
            media.format,
        )

    else:
        # Compatibilidad con los archivos locales anteriores.
        local_prefix = f"/api/uploads/requests/{necesidad.request_id}/"

        if media.url.startswith(local_prefix):
            file_path = os.path.join(
                UPLOAD_ROOT,
                necesidad.request_id,
                os.path.basename(media.url),
            )

            try:
                os.remove(file_path)

            except FileNotFoundError:
                pass

            except OSError:
                raise APIException(
                    "No se pudo eliminar el archivo local.",
                    status_code=500,
                ) from None

    try:
        RequestMediaRepository.delete(media)

    except SQLAlchemyError:
        db.session.rollback()

        raise APIException(
            "No se pudo eliminar el registro. Inténtalo de nuevo.",
            status_code=500,
        ) from None


def set_necesidad_media_cover(request_id, media_id, shelter_id):
    necesidad = _get_owned_necesidad(request_id, shelter_id)

    media = RequestMediaRepository.get_by_media_id(media_id)

    if media is None or media.request_id != necesidad.id:
        raise APIException(
            "Recurso no encontrado",
            status_code=404,
        )

    try:
        RequestMediaRepository.clear_cover(necesidad.id)
        media.is_cover = True

        return RequestMediaRepository.save(media)

    except SQLAlchemyError:
        db.session.rollback()

        raise APIException(
            "No se pudo cambiar la imagen de portada.",
            status_code=500,
        ) from None