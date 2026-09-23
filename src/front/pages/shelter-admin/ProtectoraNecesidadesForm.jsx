import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  crearNecesidad,
  deleteNecesidadMedia,
  getShelterNecesidad,
  setNecesidadMediaCover,
  uploadNecesidadMedia,
} from "../../services/requestsService";
import { cargarMediaUrl, getShelterAnimals } from "../../services/animalsService";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { SectionCard } from "../../components/protectora/SectionCard";
import { NecesidadPreviewCard } from "../../components/protectora/NecesidadPreviewCard";
import { AnimalMiniAvatar } from "../../components/protectora/AnimalMiniAvatar";
import { usePageTitle } from "../../hooks/usePageTitle";

const BYTES_MAX_IMAGEN = 10 * 1024 * 1024;

// iconos simples por nombre de tipo de ayuda (vienen del seed, ver src/api/data/request_type.json)
const ICONOS_TIPO_AYUDA = {
  "money": "💶",
  "resources": "📦",
  "time": "⏱️",
  "others": "✨",
};

const UNIDADES = ["€", "kg", "horas", "unidades"];

const OPCIONES_DIAS = [
  { label: "En 7 días", dias: 7 },
  { label: "En 15 días", dias: 15 },
  { label: "En 30 días", dias: 30 },
];

const MAX_LONGITUD_NOMBRE = 80;
const MAX_LONGITUD_DESCRIPCION = 500;

const sumarDias = (dias) => {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  return fecha.toISOString().slice(0, 10);
};

export const ProtectoraNecesidadesForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const { store, dispatch } = useGlobalReducer();
  const requestTypes = store.requestTypes;

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);

  const [loadedNecesidad, setLoadedNecesidad] = useState(null);
  const [loadingNecesidad, setLoadingNecesidad] = useState(isEditMode);
  const [loadError, setLoadError] = useState("");
  const isDraft = isEditMode && loadedNecesidad?.status === "borrador";
  const prefilledRef = useRef(false);
  const initialMediaIdsRef = useRef([]);

  const tipoAyudaRef = useRef(null);
  const nameRef = useRef(null);

  const [shelterAnimals, setShelterAnimals] = useState([]);
  const [showAnimalPicker, setShowAnimalPicker] = useState(false);
  const [animalQuery, setAnimalQuery] = useState("");

  usePageTitle(isEditMode ? "Panel · Editar necesidad" : "Panel · Nueva necesidad");

  const [mediaItems, setMediaItems] = useState([]);
  const [coverId, setCoverId] = useState(null);
  const [hoveredMediaId, setHoveredMediaId] = useState(null);
  const [isDraggingMedia, setIsDraggingMedia] = useState(false);

  const [form, setForm] = useState({
    request_type_id: "",
    name: "",
    description: "",
    animal_id: "",
    hasLimit: true,
    amountNeeded: "",
    unit: "€",
    footnote: "",
    hasDeadline: false,
    requestDeadline: "",
    status: "borrador",
  });

  // trae los animales de la protectora para el selector "Animal relacionado"
  useEffect(() => {
    getShelterAnimals({ ordenarPor: "name", orden: "asc", pagina: 1, perPage: 100 })
      .then((data) => setShelterAnimals(data.items || []))
      .catch(() => {});
  }, []);

  // en modo edición, trae la necesidad a actualizar
  useEffect(() => {
    if (!isEditMode) return;
    let cancelled = false;
    setLoadingNecesidad(true);
    setLoadError("");

    getShelterNecesidad(id)
      .then((necesidad) => {
        if (!cancelled) setLoadedNecesidad(necesidad);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoadingNecesidad(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, isEditMode]);

  // espera a tener la necesidad Y el catálogo de tipos (para resaltar el request_type_id público) antes de rellenar
  useEffect(() => {
    if (!loadedNecesidad || requestTypes.length === 0 || prefilledRef.current) return;
    prefilledRef.current = true;

    const requestType = requestTypes.find((t) => t.id === loadedNecesidad.request_type_id);
    const animal = shelterAnimals.find((a) => a.id === loadedNecesidad.animal_id);

    setForm({
      request_type_id: requestType?.request_type_id || "",
      name: loadedNecesidad.name || "",
      description: loadedNecesidad.description || "",
      animal_id: animal?.animal_id || "",
      hasLimit: loadedNecesidad.amount_needed != null,
      amountNeeded: loadedNecesidad.amount_needed != null ? String(Number(loadedNecesidad.amount_needed)) : "",
      unit: loadedNecesidad.unit || "€",
      footnote: loadedNecesidad.footnote || "",
      hasDeadline: Boolean(loadedNecesidad.request_deadline),
      requestDeadline: loadedNecesidad.request_deadline ? loadedNecesidad.request_deadline.slice(0, 10) : "",
      status: loadedNecesidad.status || "borrador",
    });

    const media = loadedNecesidad.media || [];
    initialMediaIdsRef.current = media.map((item) => item.media_id);
    setMediaItems(
      media.map((item) => ({
        id: item.media_id,
        file: null,
        previewUrl: cargarMediaUrl(item.url),
        kind: item.format,
        isExisting: true,
      })),
    );
    const cover = media.find((item) => item.is_cover) || media[0];
    setCoverId(cover ? cover.media_id : null);
  }, [loadedNecesidad, requestTypes, shelterAnimals]);

  const handleField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const elegirDiasLimite = (dias) => {
    setForm((prev) => ({ ...prev, hasDeadline: true, requestDeadline: sumarDias(dias) }));
  };

  const elegirSinFechaLimite = () => {
    setForm((prev) => ({ ...prev, hasDeadline: false, requestDeadline: "" }));
  };

  const focusInvalidField = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    ref.current?.focus?.({ preventScroll: true });
  };

  const selectedRequestType = requestTypes.find((t) => t.request_type_id === form.request_type_id);
  const isTipoAyudaValid = Boolean(form.request_type_id);

  const selectedAnimal = shelterAnimals.find((a) => a.animal_id === form.animal_id) || null;

  const animalQueryTrimmed = animalQuery.trim().toLowerCase();

  const filteredAnimals = animalQueryTrimmed
    ? shelterAnimals.filter((a) => a.name?.toLowerCase().includes(animalQueryTrimmed))
    : shelterAnimals;

  const ANIMAL_LIST_LIMIT = 20;

  const visibleAnimals = filteredAnimals.slice(0, ANIMAL_LIST_LIMIT);

  const hiddenAnimalsCount = filteredAnimals.length - visibleAnimals.length;

  const elegirAnimal = (animalId) => {
    handleField("animal_id", animalId);
    setAnimalQuery("");
    setShowAnimalPicker(false);
  };

  const addTileInputRef = useRef(null);
  const photoInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const handleAddFiles = (fileList, kindHint) => {
    if (!fileList || fileList.length === 0) return;

    const accepted = [];
    let rejected = false;

    Array.from(fileList).forEach((file) => {
      const kind = kindHint || (file.type.startsWith("video") ? "video" : "image");
      if (kind === "image" && file.size > BYTES_MAX_IMAGEN) {
        rejected = true;
        return;
      }
      accepted.push({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        kind,
        isExisting: false,
      });
    });

    setFieldErrors((prev) => {
      const next = { ...prev };
      if (rejected) next.media = "Error en la foto seleccionada";
      else delete next.media;
      return next;
    });

    if (accepted.length > 0) {
      setMediaItems((prev) => [...prev, ...accepted]);
      setCoverId((prev) => prev || accepted[0].id);
    }
  };

  const handleBorrarMedia = (id) => {
    setMediaItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target && target.previewUrl?.startsWith("blob:")) URL.revokeObjectURL(target.previewUrl);
      const next = prev.filter((item) => item.id !== id);
      setCoverId((prevCover) => (prevCover === id ? next[0]?.id || null : prevCover));
      return next;
    });
  };

  const handleDragOverMedia = (e) => {
    e.preventDefault();
    setIsDraggingMedia(true);
  };

  const handleDragLeaveMedia = () => setIsDraggingMedia(false);

  const handleDropMedia = (e) => {
    e.preventDefault();
    setIsDraggingMedia(false);
    handleAddFiles(e.dataTransfer.files);
  };

  const syncNecesidadMedia = async (requestId) => {
    const newItems = mediaItems.filter((item) => !item.isExisting);
    for (const item of newItems) {
      await uploadNecesidadMedia(requestId, item.file, item.id === coverId);
    }

    const keptExisting = mediaItems.filter((item) => item.isExisting);
    const coverIsNewItem = newItems.some((item) => item.id === coverId);
    if (!coverIsNewItem && coverId && keptExisting.some((item) => item.id === coverId)) {
      await setNecesidadMediaCover(requestId, coverId);
    }

    const currentExistingIds = new Set(keptExisting.map((item) => item.id));
    const removedIds = initialMediaIdsRef.current.filter((mediaId) => !currentExistingIds.has(mediaId));
    for (const mediaId of removedIds) {
      await deleteNecesidadMedia(requestId, mediaId).catch(() => {});
    }
  };

  const guardarNecesidad = async (status) => {
    setError("");

    const nextFieldErrors = {};
    if (!form.request_type_id) {
      nextFieldErrors.request_type_id = "Elige un tipo de ayuda para continuar";
    }
    if (!form.name.trim()) {
      nextFieldErrors.name = "El nombre de la necesidad es obligatorio";
    }
    if (!form.description.trim()) {
      nextFieldErrors.description = "Desarrolla la necesidad para que la gente interesada pueda colaborar";
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors((prev) => ({ ...prev, ...nextFieldErrors }));
      setError("Falta completar algún dato: revisa los campos marcados en rojo.");
      focusInvalidField(nextFieldErrors.request_type_id ? tipoAyudaRef : nameRef);
      return;
    }

    setSaving(true);
    setPendingStatus(status || null);
    try {
      const resultado = await crearNecesidad({
        ...(isEditMode ? { request_id: id } : {}),
        ...(status ? { status } : {}),
        request_type_id: form.request_type_id,
        name: form.name.trim(),
        description: form.description.trim(),
        animal_id: form.animal_id || null,
        amount_needed: form.hasLimit && form.amountNeeded ? Number(form.amountNeeded) : null,
        unit: form.unit,
        footnote: form.footnote,
        request_deadline: form.hasDeadline && form.requestDeadline ? form.requestDeadline : null,
      });

      let mediaWarning = "";
      try {
        await syncNecesidadMedia(resultado.request_id);
      } catch (mediaErr) {
        mediaWarning = " Se ha producido un error al guardar las fotos/vídeos: " + mediaErr.message;
      }

      const successMessage =
        (isEditMode
          ? `${form.name.trim()} se ha actualizado correctamente.`
          : status === "borrador"
            ? `${form.name.trim()} se ha guardado como borrador.`
            : `${form.name.trim()} se ha publicado correctamente.`) + mediaWarning;

      dispatch({ type: mediaWarning ? "set-error" : "set-success", payload: successMessage });

      navigate(resultado.location);


    } catch (err) {
      setError(err.message);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
      setPendingStatus(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    guardarNecesidad(isEditMode ? undefined : "abierta");
  };

  const handleGuardarBorrador = () => {
    guardarNecesidad("borrador");
  };

  const handlePublicar = () => {
    guardarNecesidad("abierta");
  };

  return (
    <div className="container py-5">
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-2">{isEditMode ? "Editar necesidad" : "¿Con qué os pueden ayudar?"}</h2>
          {isEditMode ? (
            <p className="mb-0">Actualiza los datos de la necesidad. Los cambios se guardan sobre la misma publicación.</p>
          ) : (
            <p className="mb-0">
              Publicad una necesidad concreta y aparecerá en el tablón de las personas colaboradoras. Podréis editarla o
              cerrarla en cualquier momento.
            </p>
          )}
        </div>
        <Link to="/panel/necesidades" className="btn btn-outline-secondary rounded-pill px-4">
          Volver
        </Link>
      </div>

      {loadingNecesidad ? (
        <div className="text-center text-muted py-5">Cargando necesidad…</div>
      ) : loadError ? (
        <div className="alert alert-danger" role="alert">
          {loadError}
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-8 order-1">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <SectionCard
                number={1}
                title="Tipo de ayuda"
                subtitle="Define cómo colaborará la gente y en qué unidades se mide la necesidad."
                unlocked
              >
                <div
                  ref={tipoAyudaRef}
                  tabIndex={-1}
                  className="row g-3 mb-2"
                  style={
                    fieldErrors.request_type_id
                      ? { outline: "2px solid var(--rp-arcilla)", outlineOffset: "0px", borderRadius: "12px" }
                      : undefined
                  }
                >
                  {requestTypes.length === 0 && <div className="col-12 text-muted">Cargando tipos de ayuda…</div>}
                  {requestTypes.map((type) => {
                    const selected = form.request_type_id === type.request_type_id;
                    return (
                      <div className="col-12 col-sm-6" key={type.request_type_id}>
                        <button
                          type="button"
                          onClick={() => handleField("request_type_id", type.request_type_id)}
                          className="d-flex align-items-center gap-3 w-100 text-start p-3 rounded-4 border"
                          style={{
                            backgroundColor: selected ? "var(--rp-verde-cl)" : "var(--rp-papel)",
                            borderColor: selected ? "var(--rp-verde)" : "var(--rp-linea)",
                            borderWidth: selected ? "2px" : "1px",
                            transition: "all 0.15s ease",
                          }}
                        >
                          <span
                            className="d-inline-flex align-items-center justify-content-center flex-shrink-0"
                            style={{
                              width: "44px",
                              height: "44px",
                              borderRadius: "12px",
                              backgroundColor: "var(--rp-verde-cl)",
                              fontSize: "1.3rem",
                            }}
                          >
                            {ICONOS_TIPO_AYUDA[type.code] || "🐾"}
                          </span>
                          <span>
                            <span className="d-block fw-bold" style={{ color: "var(--rp-pino)" }}>
                              {type.name}
                            </span>
                            <span className="d-block" style={{ color: "var(--rp-gris)", fontSize: "0.8125rem" }}>
                              {type.description}
                            </span>
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>
                {fieldErrors.request_type_id && (
                  <div
                    className="d-flex align-items-center gap-1 mb-2"
                    style={{ color: "var(--rp-arcilla)", fontSize: "0.8rem" }}
                  >
                    <span aria-hidden="true">⚠</span> {fieldErrors.request_type_id}
                  </div>
                )}
              </SectionCard>

              <SectionCard
                number={2}
                title="Qué necesitáis"
                subtitle="Un título claro y el contexto justo. Es lo primero que se lee en el tablón."
                unlocked={isTipoAyudaValid}
              >
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-baseline">
                    <label className="form-label mb-0" htmlFor="name">
                      Nombre de la necesidad
                    </label>
                    <span style={{ color: "var(--rp-gris)", fontSize: "0.7rem" }}>
                      {form.name.length}/{MAX_LONGITUD_NOMBRE}
                    </span>
                  </div>
                  <input
                    id="name"
                    ref={nameRef}
                    type="text"
                    maxLength={MAX_LONGITUD_NOMBRE}
                    className={`form-control mt-1${fieldErrors.name ? " is-invalid" : ""}`}
                    style={fieldErrors.name ? { borderColor: "var(--rp-arcilla)" } : undefined}
                    placeholder="Cirugía Nala"
                    value={form.name}
                    aria-invalid={Boolean(fieldErrors.name)}
                    onChange={(e) => handleField("name", e.target.value)}
                  />
                  <p className="mb-0 mt-1 text-muted" style={{ fontSize: "0.75rem" }}>
                    Nombra la cosa, no la petición: «Pienso de cachorro» funciona mejor que «Necesitamos ayuda urgente».
                  </p>
                  {fieldErrors.name && (
                    <div
                      className="d-flex align-items-center gap-1 mt-1 text-danger"
                      style={{ fontSize: "0.8rem" }}
                    >
                      <span aria-hidden="true">⚠</span> {fieldErrors.name}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-baseline">
                    <label className="form-label mb-0" htmlFor="description">
                      Descripción
                    </label>
                    <span style={{ color: "var(--rp-gris)", fontSize: "0.7rem" }}>
                      requerido · {form.description.length}/{MAX_LONGITUD_DESCRIPCION}
                    </span>
                  </div>
                  <textarea
                    id="description"
                    className="form-control mt-1"
                    rows="3"
                    maxLength={MAX_LONGITUD_DESCRIPCION}
                    placeholder="Nala llegó con la cadera dañada. La operación cuesta 600 € y la tenemos programada para el 3 de septiembre en la clínica del barrio."
                    value={form.description}
                    style={fieldErrors.description ? { borderColor: "var(--rp-arcilla)" } : undefined}
                    onChange={(e) => handleField("description", e.target.value)}
                  />
                  <p className="mb-0 mt-1 text-muted" style={{ fontSize: "0.75rem" }}>
                    Cuenta con detalle para qué es y qué vale: la gente colabora más cuando sabe dónde acaba su ayuda.
                  </p>
                  {fieldErrors.description && (
                      <div
                          className="d-flex align-items-center gap-1 mt-1 text-danger"
                          style={{ fontSize: "0.8rem" }}
                      >
                        <span aria-hidden="true">⚠</span> {fieldErrors.description}
                      </div>
                  )}
                </div>

                <div className="mb-0">
                  <div className="d-flex justify-content-between align-items-baseline mb-2">
                    <label className="form-label mb-0">Animal relacionado</label>
                    <span style={{ color: "var(--rp-gris)", fontSize: "0.7rem" }}>opcional</span>
                  </div>

                  {!showAnimalPicker ? (
                    <div
                      className="d-flex align-items-center gap-3 w-100 p-3 rounded-4 border"
                      style={{ borderColor: "var(--rp-verde)", borderWidth: "2px", backgroundColor: "var(--rp-verde-cl)" }}
                    >
                      {selectedAnimal ? (
                        <AnimalMiniAvatar animal={selectedAnimal} size={64} backgroundColor="var(--rp-papel)" />
                      ) : (
                        <span
                          className="d-inline-flex align-items-center justify-content-center flex-shrink-0 rounded-circle"
                          style={{ width: "36px", height: "36px", backgroundColor: "var(--rp-hueso)" }}
                        >
                          —
                        </span>
                      )}
                      <span className="flex-grow-1">
                        <span className="d-block fw-bold" style={{ color: "var(--rp-pino)" }}>
                          {selectedAnimal ? selectedAnimal.name : "Necesidad general"}
                        </span>
                        <span className="d-block" style={{ color: "var(--rp-gris)", fontSize: "0.8125rem" }}>
                          {selectedAnimal ? `${selectedAnimal.breed} · ${selectedAnimal.status}` : "Para toda la protectora"}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowAnimalPicker(true)}
                        className="btn btn-outline-success btn-sm rounded-pill px-3 flex-shrink-0"
                      >
                        Cambiar
                      </button>
                    </div>
                  ) : (
                    <div className="border rounded-4 p-2" style={{ borderColor: "var(--rp-linea)" }}>
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <input
                          type="search"
                          autoFocus
                          className="form-control"
                          placeholder="Buscar animal por nombre…"
                          value={animalQuery}
                          onChange={(e) => setAnimalQuery(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setShowAnimalPicker(false);
                            setAnimalQuery("");
                          }}
                          className="btn btn-outline-secondary btn-sm rounded-pill px-3 flex-shrink-0"
                        >
                          Cerrar
                        </button>
                      </div>

                      <div className="d-flex flex-column gap-2" style={{ maxHeight: "280px", overflowY: "auto" }}>
                        <button
                          type="button"
                          onClick={() => elegirAnimal("")}
                          className="d-flex align-items-center gap-3 w-100 text-start p-2 rounded-4 border"
                          style={{
                            backgroundColor: form.animal_id === "" ? "var(--rp-verde-cl)" : "var(--rp-papel)",
                            borderColor: form.animal_id === "" ? "var(--rp-verde)" : "var(--rp-linea)",
                            borderWidth: form.animal_id === "" ? "2px" : "1px",
                          }}
                        >
                          <span
                            className="d-inline-flex align-items-center justify-content-center flex-shrink-0 rounded-circle"
                            style={{ width: "32px", height: "32px", backgroundColor: "var(--rp-hueso)" }}
                          >
                            —
                          </span>
                          <span>
                            <span className="d-block fw-bold" style={{ color: "var(--rp-pino)", fontSize: "0.9rem" }}>
                              Necesidad general
                            </span>
                            <span className="d-block" style={{ color: "var(--rp-gris)", fontSize: "0.75rem" }}>
                              Para toda la protectora
                            </span>
                          </span>
                        </button>

                        {visibleAnimals.length === 0 && (
                          <p className="text-muted text-center mb-0 py-2" style={{ fontSize: "0.85rem" }}>
                            Ningún animal coincide con «{animalQuery}».
                          </p>
                        )}

                        {visibleAnimals.map((animal) => {
                          const selected = form.animal_id === animal.animal_id;
                          return (
                            <button
                              type="button"
                              key={animal.animal_id}
                              onClick={() => elegirAnimal(animal.animal_id)}
                              className="d-flex align-items-center gap-3 w-100 text-start p-2 rounded-4 border"
                              style={{
                                backgroundColor: selected ? "var(--rp-verde-cl)" : "var(--rp-papel)",
                                borderColor: selected ? "var(--rp-verde)" : "var(--rp-linea)",
                                borderWidth: selected ? "2px" : "1px",
                              }}
                            >
                              <AnimalMiniAvatar animal={animal} size={28} />
                              <span>
                                <span className="d-block fw-bold" style={{ color: "var(--rp-pino)", fontSize: "0.9rem" }}>
                                  {animal.name}
                                </span>
                                <span className="d-block" style={{ color: "var(--rp-gris)", fontSize: "0.75rem" }}>
                                  {animal.breed} · {animal.status}
                                </span>
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {hiddenAnimalsCount > 0 && (
                        <p className="text-muted mb-0 mt-2 text-center" style={{ fontSize: "0.75rem" }}>
                          Hay {hiddenAnimalsCount} más — sigue escribiendo para acotar la búsqueda.
                        </p>
                      )}
                    </div>
                  )}

                  <p className="mb-0 mt-2 text-muted" style={{ fontSize: "0.75rem" }}>
                    Al vincular un animal, su foto y su ficha aparecen en la necesidad.
                  </p>
                </div>
              </SectionCard>

              <SectionCard
                number={3}
                title="Fotos y vídeos"
                subtitle="Opcional, pero ayuda mucho: una foto del gasto, del animal o del material necesario."
                unlocked={isTipoAyudaValid}
              >
                <div className="d-flex flex-wrap gap-3 mb-3">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => addTileInputRef.current?.click()}
                    onKeyDown={(e) => e.key === "Enter" && addTileInputRef.current?.click()}
                    onDragOver={handleDragOverMedia}
                    onDragLeave={handleDragLeaveMedia}
                    onDrop={handleDropMedia}
                    className="d-flex flex-column align-items-center justify-content-center rounded-4"
                    style={{
                      width: "128px",
                      height: "128px",
                      border: `2px dashed ${isDraggingMedia ? "var(--rp-verde)" : "var(--rp-linea)"}`,
                      backgroundColor: isDraggingMedia ? "var(--rp-verde-cl)" : "var(--rp-hueso)",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <span style={{ fontSize: "1.5rem", color: "var(--rp-gris)", lineHeight: 1 }}>+</span>
                    <span className="mt-1" style={{ fontSize: "0.8rem", color: "var(--rp-gris)" }}>
                      Añadir
                    </span>
                  </div>

                  {mediaItems.map((item) => {
                    const isCover = item.id === coverId;
                    const isHovered = hoveredMediaId === item.id;
                    return (
                      <div
                        key={item.id}
                        onMouseEnter={() => setHoveredMediaId(item.id)}
                        onMouseLeave={() => setHoveredMediaId(null)}
                        className="position-relative rounded-4 overflow-hidden"
                        style={{
                          width: "128px",
                          height: "128px",
                          border: `2px solid ${isCover ? "var(--rp-verde)" : "var(--rp-linea)"}`,
                        }}
                      >
                        {item.kind === "video" ? (
                          <video src={item.previewUrl} muted className="w-100 h-100" style={{ objectFit: "cover" }} />
                        ) : (
                          <img src={item.previewUrl} alt="" className="w-100 h-100" style={{ objectFit: "cover" }} />
                        )}

                        {isCover && (
                          <span
                            className="position-absolute top-0 start-0 m-1 badge rounded-pill text-white bg-success"
                            style={{ fontSize: "0.6rem" }}
                          >
                            Portada
                          </span>
                        )}

                        {isHovered && (
                          <div
                            className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center gap-1"
                            style={{ backgroundColor: "rgba(18, 58, 43, 0.55)" }}
                          >
                            {!isCover && item.kind !== "video" && (
                              <button
                                type="button"
                                onClick={() => setCoverId(item.id)}
                                className="btn btn-light btn-sm rounded-pill px-2 py-0"
                                style={{ fontSize: "0.7rem" }}
                              >
                                Marcar portada
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleBorrarMedia(item.id)}
                              className="btn btn-light btn-sm rounded-pill px-2 py-0"
                              style={{ fontSize: "0.7rem" }}
                            >
                              Quitar
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <input
                  ref={addTileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,video/mp4,video/quicktime"
                  multiple
                  hidden
                  onChange={(e) => {
                    handleAddFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  multiple
                  hidden
                  onChange={(e) => {
                    handleAddFiles(e.target.files, "image");
                    e.target.value = "";
                  }}
                />
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/mp4,video/quicktime"
                  multiple
                  hidden
                  onChange={(e) => {
                    handleAddFiles(e.target.files, "video");
                    e.target.value = "";
                  }}
                />

                <div className="d-flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="btn btn-light rounded-pill border px-3 py-2"
                  >
                    Añadir fotos
                  </button>
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    className="btn btn-light rounded-pill border px-3 py-2"
                  >
                    Añadir vídeo
                  </button>
                </div>

                <p className="mb-0 text-muted" style={{ fontSize: "0.8rem" }}>
                  Formatos JPG, PNG, MP4 o MOV · hasta 10 MB por foto. Pasa el ratón sobre una pieza para marcarla como
                  portada o quitarla.
                </p>
                {fieldErrors.media && (
                  <div
                    className="d-flex align-items-center gap-1 mt-2"
                    style={{ color: "var(--rp-arcilla)", fontSize: "0.8rem" }}
                  >
                    <span aria-hidden="true">⚠</span> {fieldErrors.media}
                  </div>
                )}
              </SectionCard>

              <SectionCard
                number={4}
                title="Cuánto hace falta"
                subtitle="Marca cuándo se considera cubierta la necesidad."
                unlocked={isTipoAyudaValid}
              >
                <div className="d-flex w-100 gap-1 p-1 rounded-pill mb-3" style={{ backgroundColor: "var(--rp-verde-cl)" }}>
                  {[
                    { label: "Cantidad concreta", value: true },
                    { label: "Sin límite", value: false },
                  ].map((opt) => {
                    const selected = form.hasLimit === opt.value;
                    return (
                      <button
                        type="button"
                        key={opt.label}
                        onClick={() => handleField("hasLimit", opt.value)}
                        className="flex-fill text-center rounded-pill py-2 px-2 fw-semibold"
                        style={{
                          backgroundColor: selected ? "var(--rp-papel)" : "transparent",
                          color: selected ? "var(--rp-verde-osc)" : "var(--rp-pino)",
                          boxShadow: selected ? "0 1px 3px rgba(0,0,0,0.12)" : "none",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                {form.hasLimit && (
                  <div className="row g-3">
                    <div className="col-12 col-sm-6">
                      <label className="form-label" htmlFor="amountNeeded">
                        Cantidad objetivo
                      </label>
                      <input
                        id="amountNeeded"
                        type="number"
                        min="0"
                        step="0.01"
                        className="form-control"
                        placeholder="600"
                        value={form.amountNeeded}
                        onChange={(e) => handleField("amountNeeded", e.target.value)}
                      />
                    </div>
                    <div className="col-12 col-sm-6">
                      <label className="form-label" htmlFor="unit">
                        Unidad
                      </label>
                      <select
                        id="unit"
                        className="form-select"
                        value={form.unit}
                        onChange={(e) => handleField("unit", e.target.value)}
                      >
                        {UNIDADES.map((unidad) => (
                          <option key={unidad} value={unidad}>
                            {unidad}
                          </option>
                        ))}
                      </select>
                    </div>
                    <p className="mb-0 mt-1 text-muted" style={{ fontSize: "0.75rem" }}>
                      Se mostrará como barra de progreso: 0/{form.amountNeeded || "—"} {form.unit}. La necesidad se cierra
                      sola al llegar al objetivo.
                    </p>
                  </div>
                )}
                
                <div className="mt-3">
                  <label className="form-label" htmlFor="footnote">
                    Nota corta <span className="text-secondary">(opcional)</span>
                  </label>
                  <input
                    id="footnote"
                    type="text"
                    className="form-control"
                    maxLength={60}
                    value={form.footnote}
                    onChange={(e) => handleField("footnote", e.target.value)}
                    placeholder="Ej: Recogen en el refugio"
                  />
                  <div className="form-text">Se mostrará debajo de la barra de progreso en el tablón público.</div>
                </div>
              </SectionCard>

              <SectionCard
                number={5}
                title="Hasta cuándo"
                subtitle="Las necesidades con fecha se ordenan antes en el tablón de colaboradores."
                unlocked={isTipoAyudaValid}
              >
                <div className="d-flex flex-wrap gap-2 mb-3">
                  {OPCIONES_DIAS.map((opt) => {
                    const selected = form.hasDeadline && form.requestDeadline === sumarDias(opt.dias);
                    return (
                      <button
                        type="button"
                        key={opt.label}
                        onClick={() => elegirDiasLimite(opt.dias)}
                        className="rounded-pill border px-3 py-2"
                        style={{
                          borderColor: selected ? "var(--rp-verde)" : "var(--rp-linea)",
                          backgroundColor: selected ? "var(--rp-verde-cl)" : "var(--rp-papel)",
                          color: selected ? "var(--rp-verde-osc)" : "var(--rp-pino)",
                          fontSize: "0.85rem",
                        }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={elegirSinFechaLimite}
                    className="rounded-pill border px-3 py-2"
                    style={{
                      borderColor: !form.hasDeadline ? "var(--rp-verde)" : "var(--rp-linea)",
                      backgroundColor: !form.hasDeadline ? "var(--rp-verde-cl)" : "var(--rp-papel)",
                      color: !form.hasDeadline ? "var(--rp-verde-osc)" : "var(--rp-pino)",
                      fontSize: "0.85rem",
                    }}
                  >
                    Sin fecha límite
                  </button>
                </div>

                <div className="mb-0">
                  <label className="form-label" htmlFor="requestDeadline">
                    Fecha límite
                  </label>
                  <input
                    id="requestDeadline"
                    type="date"
                    className="form-control"
                    value={form.requestDeadline}
                    disabled={!form.hasDeadline}
                    onChange={(e) => handleField("requestDeadline", e.target.value)}
                  />
                </div>
              </SectionCard>
            </div>

            <div className="col-md-3 mb-5 mt-3 mt-md-0 order-2">
              <NecesidadPreviewCard
                requestType={selectedRequestType}
                form={form}
                mediaItems={mediaItems}
                coverId={coverId}
              />
            </div>

            <div className="col-md-8 order-3 d-flex flex-wrap gap-2">
              {!isEditMode && (
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-pill px-4"
                  disabled={saving}
                  onClick={handleGuardarBorrador}
                >
                  {saving && pendingStatus === "borrador" ? "Guardando…" : "Guardar borrador"}
                </button>
              )}
              <button
                type="submit"
                className={`btn rounded-pill px-4 ${isDraft ? "btn-outline-secondary" : "btn-success"}`}
                disabled={saving}
              >
                {saving && pendingStatus === (isEditMode ? null : "abierta")
                  ? "Guardando…"
                  : isEditMode
                    ? isDraft
                      ? "Guardar borrador"
                      : "Actualizar"
                    : "Publicar necesidad"}
              </button>
              {isDraft && (
                <button
                  type="button"
                  className="btn btn-success rounded-pill px-4"
                  disabled={saving}
                  onClick={handlePublicar}
                >
                  {saving && pendingStatus === "abierta" ? "Publicando…" : "Publicar"}
                </button>
              )}
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
