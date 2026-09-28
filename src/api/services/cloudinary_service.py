import os

import cloudinary
import cloudinary.uploader
from cloudinary.exceptions import Error as CloudinaryError


MAX_BYTES = 10 * 1024 * 1024

CREDENTIALS = (
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
)

ALLOWED_TYPES = {
    "image/jpeg": "image",
    "image/png": "image",
    "image/webp": "image",
    "video/mp4": "video",
    "video/quicktime": "video",
}

MAX_IMAGE_BYTES = 10 * 1024 * 1024
MAX_VIDEO_BYTES = 50 * 1024 * 1024

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png"}
ALLOWED_VIDEO_TYPES = {"video/mp4", "video/quicktime"}

ALLOWED_IMAGE_FORMATS = ["jpg", "png"]
ALLOWED_VIDEO_FORMATS = ["mp4", "mov"]

# Error genérico al llamar a Cloudinary
class CloudinaryServiceError(Exception):
    pass

# Las credenciales o configuracion de .env no están completas
class CloudinaryConfigError(CloudinaryServiceError):
    pass

# Conectamos con coludinary pero devolvió un error
class CloudinaryUploadError(CloudinaryServiceError):
    pass

# Custom exception para raise haci arriba
class UploadMediaError(Exception):
    def __init__(self, message, status=400, provider_error=None):
        super().__init__(message)
        self.status = status
        self.provider_error = provider_error

# el fichero no cumple con lo que marcamos
class MediaValidationError(Exception):
    def __init__(self, message, status_code=400):
        super().__init__(message)
        self.status_code = status_code


# validamos que tenemos los .env bien
def _missing_credentials():
    return [
        name
        for name in CREDENTIALS
        if not os.getenv(name, "").strip()
    ]


# Comprobar las variables
def upload_config():
    missing = _missing_credentials()
    return {
        "cloudinary_configured": not missing,
        "missing_variables": missing,
        "max_bytes": MAX_BYTES,
    }

def is_configured():
    return not _missing_credentials()


def configure():
    if _missing_credentials():
        raise CloudinaryConfigError("Faltan las credenciales de Cloudinary.")

    cloudinary.config(
        cloud_name=os.environ["CLOUDINARY_CLOUD_NAME"].strip(),
        api_key=os.environ["CLOUDINARY_API_KEY"].strip(),
        api_secret=os.environ["CLOUDINARY_API_SECRET"].strip(),
        secure=True,
    )

# Comprueba que el archivo sea una imagen o vídeo admitido y de tamaño válido. Devuelve (media_format, allowed_formats) para usar en upload_media
def validate_media_file(file):
    if file is None or not file.filename:
        raise MediaValidationError("No se ha recibido ningún archivo")

    if file.mimetype in ALLOWED_IMAGE_TYPES:
        media_format = "image"
        max_bytes = MAX_IMAGE_BYTES
        allowed_formats = ALLOWED_IMAGE_FORMATS

    elif file.mimetype in ALLOWED_VIDEO_TYPES:
        media_format = "video"
        max_bytes = MAX_VIDEO_BYTES
        allowed_formats = ALLOWED_VIDEO_FORMATS

    else:
        raise MediaValidationError("Formato de archivo no admitido")

    file.stream.seek(0, os.SEEK_END)
    size = file.stream.tell()
    file.stream.seek(0)

    if size == 0:
        raise MediaValidationError("El archivo está vacío")

    if size > max_bytes:
        raise MediaValidationError("El archivo supera el tamaño máximo permitido")

    return media_format, allowed_formats


def upload_media(
    file,
    resource_type,
    allowed_formats,
    public_id=None,
    folder=None,
    overwrite=False,
    timeout=60,
):
    configure()

    try:
        return cloudinary.uploader.upload(
            file,
            resource_type=resource_type,
            public_id=public_id,
            allowed_formats=allowed_formats,
            overwrite=overwrite,
            timeout=timeout,
            folder=folder,
        )

    except CloudinaryError as error:
        raise CloudinaryUploadError(str(error)) from error


def delete_media(public_id, resource_type, invalidate=True, timeout=30):
    configure()

    try:
        result = cloudinary.uploader.destroy(
            public_id,
            resource_type=resource_type,
            invalidate=invalidate,
            timeout=timeout,
        )

    except CloudinaryError as error:
        raise CloudinaryUploadError(str(error)) from error

    return result.get("result") in ("ok", "not found")