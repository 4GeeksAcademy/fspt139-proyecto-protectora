import { useState } from "react";
import { uploadToCloudinary } from "../services/cloudinaryService.js";

export const UploadCloudinary = () => {
  const [file, setFile] = useState(null);
  const [uploaded, setUploaded] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setUploaded(null);

    if (!file) {
      setError("Selecciona un archivo.");
      return;
    }

    if (file.size === 0) {
      setError("El archivo está vacío.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("El archivo supera los 10 MiB.");
      return;
    }

    setLoading(true);

    try {
      const result = await uploadToCloudinary(file);
      setUploaded(result);
    } catch (err) {
      setError(err.message || "No se pudo subir el archivo.");
    } finally {
      setLoading(false);
    }
  };

  const secureUrl =
    typeof uploaded?.secure_url === "string" &&
    uploaded.secure_url.startsWith("https://")
      ? uploaded.secure_url
      : null;

  return (
    <main
      className="container py-5"
      style={{ maxWidth: 700 }}
    >
      <h1 className="mb-3" style={{ color: "var(--rp-pino)" }}>
        Subir imagen o vídeo
      </h1>

      <p className="text-muted">
        Selecciona un archivo para guardarlo en Cloudinary.
      </p>

      <form
        onSubmit={handleSubmit}
        className="card p-4"
      >
        <label htmlFor="cloudinary-file" className="form-label">
          Archivo
        </label>

        <input
          id="cloudinary-file"
          type="file"
          className="form-control"
          accept=".jpg,.jpeg,.png,.webp,.mp4,.mov"
          required
          disabled={loading}
          aria-describedby="file-help"
          onChange={(event) => {
            setFile(event.target.files?.[0] || null);
            setUploaded(null);
            setError("");
          }}
        />

        <p id="file-help" className="form-text">
          JPG, PNG, WEBP, MP4 o MOV. Máximo 10 MiB.
        </p>

        <button
          type="submit"
          className="btn btn-success mt-3"
          disabled={loading || !file}
        >
          {loading ? "Subiendo archivo…" : "Subir archivo"}
        </button>
      </form>

      <div aria-live="polite" className="mt-4">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {secureUrl && (
          <section className="card p-4">
            <p className="text-success">
              Archivo subido correctamente.
            </p>

            {uploaded.resource_type === "image" && (
              <img
                src={secureUrl}
                alt="Imagen subida a Cloudinary"
                className="img-fluid rounded mb-3"
                style={{
                  maxHeight: 400,
                  objectFit: "contain",
                }}
              />
            )}

            {uploaded.resource_type === "video" && (
              <video
                src={secureUrl}
                controls
                className="w-100 rounded mb-3"
                style={{ maxHeight: 400 }}
              />
            )}

            <a
              href={secureUrl}
              target="_blank"
              rel="noreferrer"
            >
              Abrir archivo
            </a>
          </section>
        )}
      </div>
    </main>
  );
};