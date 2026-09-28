import uuid

from sqlalchemy.exc import SQLAlchemyError

from api.models import db
from api.repositories.request_media_repository import RequestMediaRepository
from api.repositories.request_repository import RequestRepository
from api.services.cloudinary_service import (
    CloudinaryConfigError,
    CloudinaryServiceError,
    CloudinaryUploadError,
    MediaValidationError,
    delete_media,
    upload_media,
    validate_media_file,
)
from api.utils import APIException


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


def add_necesidad_media(request_id, shelter_id, file, is_cover=False):
    necesidad = _get_owned_necesidad(request_id, shelter_id)

    try:
        media_format, allowed_formats = validate_media_file(file)
    except MediaValidationError as error:
        raise APIException(str(error), status_code=error.status_code) from None

    media_id = str(uuid.uuid4())

    try:
        result = upload_media(
            file,
            resource_type=media_format,
            public_id=f"{necesidad.request_id}/{media_id}",
            allowed_formats=allowed_formats,
            overwrite=False,
            timeout=60,
            folder="requests",
        )

    except CloudinaryConfigError as error:
        raise APIException(str(error), status_code=503) from None

    except CloudinaryUploadError as error:
        raise APIException(
            f"No se pudo subir el archivo a Cloudinary: {error}",
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
            delete_media(
                result["public_id"],
                media_format,
            )

        except CloudinaryServiceError:
            pass

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
        try:
            delete_media(
                media.cloudinary_public_id,
                media.format,
            )
        except CloudinaryConfigError as error:
            raise APIException(str(error), status_code=503) from None
        except CloudinaryUploadError as error:
            raise APIException(str(error), status_code=502) from None

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