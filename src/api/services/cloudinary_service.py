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


class UploadTestError(Exception):
    def __init__(self, message, status=400, provider_error=None):
        super().__init__(message)
        self.status = status
        self.provider_error = provider_error


# Comprobar las variables sin mostrar sus valores.
def upload_config():
    missing = [
        name
        for name in CREDENTIALS
        if not os.getenv(name, "").strip()
    ]

    return {
        "cloudinary_configured": not missing,
        "missing_variables": missing,
        "max_bytes": MAX_BYTES,
    }


# Se mantienen los argumentos para los endpoints actuales.
def test_upload(file, resource_type="auto", mode="cloudinary", scenario=None):
    if mode != "cloudinary":
        raise UploadTestError(
            "El modo simulado está desactivado. Selecciona Cloudinary."
        )

    if file is None or not file.filename:
        raise UploadTestError("Selecciona un archivo.")

    file_type = ALLOWED_TYPES.get(file.mimetype)

    if file_type is None:
        raise UploadTestError(
            "Formato no admitido. Usa JPG, PNG, WEBP, MP4 o MOV.",
            415,
        )

    if resource_type not in ("auto", file_type):
        raise UploadTestError(
            "El tipo de recurso no coincide con el archivo."
        )

    # Comprobar el tamaño y volver al inicio del archivo.
    file.stream.seek(0, os.SEEK_END)
    size = file.stream.tell()
    file.stream.seek(0)

    if size == 0:
        raise UploadTestError("El archivo está vacío.")

    if size > MAX_BYTES:
        raise UploadTestError("El archivo supera los 10 MiB.", 413)

    if not upload_config()["cloudinary_configured"]:
        raise UploadTestError(
            "Faltan las credenciales de Cloudinary en el backend.",
            503,
        )

    # Configurar el SDK con las credenciales del servidor.
    cloudinary.config(
        cloud_name=os.environ["CLOUDINARY_CLOUD_NAME"].strip(),
        api_key=os.environ["CLOUDINARY_API_KEY"].strip(),
        api_secret=os.environ["CLOUDINARY_API_SECRET"].strip(),
        secure=True,
    )

    # Subir el archivo y devolver la respuesta de Cloudinary.
    try:
        return cloudinary.uploader.upload(
            file,
            resource_type=file_type,
            allowed_formats=["jpg", "png", "webp", "mp4", "mov"],
            overwrite=False,
            timeout=30,
        )

    except CloudinaryError as error:
        raise UploadTestError(
            "No se pudo subir el archivo a Cloudinary. "
            "Comprueba las credenciales y la conexión.",
            502,
            type(error).__name__,
        ) from error