import uuid

from sqlalchemy.exc import SQLAlchemyError

from api.models import db
from api.repositories.animal_media_repository import AnimalMediaRepository
from api.repositories.animal_repository import AnimalRepository
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


def _get_owned_animal(animal_id, shelter_id):
    animal = AnimalRepository.get_by_animal_id(animal_id)

    if animal is None:
        raise APIException(
            "Animal no encontrado",
            status_code=404,
        )

    if animal.shelter_id != shelter_id:
        raise APIException(
            "No tienes permiso para modificar este animal",
            status_code=403,
        )

    return animal


def add_animal_media(animal_id, shelter_id, file, is_cover=False):
    animal = _get_owned_animal(animal_id, shelter_id)

    try:
        media_format, allowed_formats = validate_media_file(file)
    except MediaValidationError as error:
        raise APIException(str(error), status_code=error.status_code) from None

    media_id = str(uuid.uuid4())

    try:
        result = upload_media(
            file,
            resource_type=media_format,
            public_id=f"{animal.animal_id}/{media_id}",
            allowed_formats=allowed_formats,
            overwrite=False,
            timeout=60,
            folder="animals",
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
            AnimalMediaRepository.clear_cover(animal.id)

        media = AnimalMediaRepository.create(
            media_id=media_id,
            animal_id=animal.id,
            format=media_format,
            url=result["secure_url"],
            cloudinary_public_id=result["public_id"],
            is_cover=bool(is_cover),
        )

        return AnimalMediaRepository.save(media)

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


def delete_animal_media(animal_id, media_id, shelter_id):
    animal = _get_owned_animal(animal_id, shelter_id)

    media = AnimalMediaRepository.get_by_media_id(media_id)

    if media is None or media.animal_id != animal.id:
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
        AnimalMediaRepository.delete(media)
    except SQLAlchemyError:
        db.session.rollback()
        raise APIException(
            "No se pudo eliminar el registro. Inténtalo de nuevo.",
            status_code=500,
        ) from None


def set_animal_media_cover(animal_id, media_id, shelter_id):
    animal = _get_owned_animal(animal_id, shelter_id)

    media = AnimalMediaRepository.get_by_media_id(media_id)

    if media is None or media.animal_id != animal.id:
        raise APIException(
            "Recurso no encontrado",
            status_code=404,
        )

    try:
        AnimalMediaRepository.clear_cover(animal.id)
        media.is_cover = True
        return AnimalMediaRepository.save(media)

    except SQLAlchemyError:
        db.session.rollback()
        raise APIException(
            "No se pudo cambiar la imagen de portada.",
            status_code=500,
        ) from None