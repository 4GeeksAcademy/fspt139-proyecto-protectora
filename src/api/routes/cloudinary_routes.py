from flask import jsonify, request
from flask_jwt_extended import jwt_required
from werkzeug.exceptions import BadRequest, RequestEntityTooLarge

from api.services.cloudinary_service import (
    MAX_BYTES,
    UploadTestError,
    test_upload,
)

from . import api
from .auth import get_current_user


# Endpoint de nuestra aplicación para subir archivos a Cloudinary.
@api.route("/upload", methods=["POST"])
@jwt_required()
def upload_to_cloudinary():
    user = get_current_user()

    if user.rol != "shelter_admin":
        return jsonify(
            error={"message": "Se requiere una cuenta de protectora."}
        ), 403

    # Límite del archivo más espacio para el formulario.
    request.max_content_length = MAX_BYTES + 64 * 1024

    try:
        files = request.files.getlist("file")

        if len(files) != 1 or set(request.files) != {"file"}:
            return jsonify(
                error={"message": "Selecciona exactamente un archivo."}
            ), 400

        result = test_upload(
            file=files[0],
            mode="cloudinary",
        )

        return jsonify(result), 200

    except UploadTestError as error:
        return jsonify(
            error={"message": str(error)}
        ), error.status

    except RequestEntityTooLarge:
        return jsonify(
            error={"message": "El archivo supera el tamaño permitido."}
        ), 413

    except BadRequest:
        return jsonify(
            error={"message": "El formulario enviado no es válido."}
        ), 400