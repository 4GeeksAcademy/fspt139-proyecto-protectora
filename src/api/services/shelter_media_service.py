from sqlalchemy.exc import SQLAlchemyError

from api.models import db
from api.repositories.shelter_repository import ShelterRepository
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


def _get_owned_shelter(shelter_pk):
    shelter = ShelterRepository.get_by_id(shelter_pk)
    if shelter is None:
        raise APIException("Protectora no encontrada", status_code=404)
    return shelter


def _logo_public_id(shelter):
    return f"shelters/{shelter.shelter_id}/logo"


def _borrar_logo_actual(shelter):
    if not shelter.logo_url:
        return

    try:
        delete_media(_logo_public_id(shelter), "image")
    except CloudinaryConfigError as error:
        raise APIException(str(error), status_code=503) from None
    except CloudinaryUploadError as error:
        raise APIException(str(error), status_code=502) from None


def add_shelter_logo(shelter_pk, file):
    shelter = _get_owned_shelter(shelter_pk)

    try:
        media_format, allowed_formats = validate_media_file(file)
    except MediaValidationError as error:
        raise APIException(str(error), status_code=error.status_code) from None

    if media_format != "image":
        raise APIException("Formato de archivo no admitido", status_code=400)

    # No hace falta borrar antes: overwrite=True sustituye el logo anterior
    # en la misma llamada, de forma atómica.
    try:
        result = upload_media(
            file,
            resource_type="image",
            public_id=_logo_public_id(shelter),
            allowed_formats=allowed_formats,
            overwrite=True,
            timeout=60,
            folder="shelters"
        )

    except CloudinaryConfigError as error:
        raise APIException(str(error), status_code=503) from None

    except CloudinaryUploadError as error:
        raise APIException(
            f"No se pudo subir el archivo a Cloudinary: {error}",
            status_code=502,
        ) from None

    try:
        shelter.logo_url = result["secure_url"]
        return ShelterRepository.save(shelter)

    except SQLAlchemyError:
        db.session.rollback()

        # Si falla la base de datos, intentar retirar el archivo subido.
        try:
            delete_media(result["public_id"], "image")
        except CloudinaryServiceError:
            pass

        raise APIException(
            "No se pudo guardar el logo en la base de datos.",
            status_code=500,
        ) from None


def delete_shelter_logo(shelter_pk):
    shelter = _get_owned_shelter(shelter_pk)

    _borrar_logo_actual(shelter)
    shelter.logo_url = None
    return ShelterRepository.save(shelter)
