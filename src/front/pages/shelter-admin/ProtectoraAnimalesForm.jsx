
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  createAnimal,
  deleteAnimalMedia,
  getShelterAnimal,
  cargarMediaUrl,
  setAnimalMediaCover,
  uploadAnimalMedia,
} from "../../services/animalsService";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { SectionCard } from "../../components/protectora/SectionCard";
import { LivePreviewCard } from "../../components/protectora/LivePreviewCard";
import { TogglePill } from "../../components/protectora/FormsProtectora/TogglePill";
import { SiNoUndefinedRow } from "../../components/protectora/FormsProtectora/SiNoUndefinedRow";

// para los casos principales de la aplicacion,
// dejamos otros por si metemos periquitos o tortugas
// todo: pasar a store si se necesita más o bbdd
const DATOS_ESPECIE = {
  Perro: { emoji: "🐶", description: "Ficha con datos del perrete" },
  Gato: { emoji: "🐱", description: "Ficha con datos del miau" },
};

const OPCIONES_TAMANO = ["Pequeño", "Mediano", "Grande"];

const PISTAS_TAMANO_POR_ESPECIE = {
  Gato: ["hasta 3 kg", "3 - 5 kg", "más de 5 kg"],
  Perro: ["hasta 10 kg", "10 - 25 kg", "más de 25 kg"],
};
const PISTAS_TAMANO_POR_DEFECTO = ["hasta 2 kg", "2 - 5 kg", "más de 5 kg"];

const UMBRALES_TAMANO_POR_ESPECIE = {
  Gato: [3, 5],
  Perro: [10, 25],
};
const UMBRALES_TAMANO_POR_DEFECTO = [2, 5];

const getSizeIndexForWeight = (weight, [small, medium]) => {
  if (weight <= small) return 0;
  if (weight <= medium) return 1;
  return 2;
};

// tramo "Pequeño" no tiene suelo definido (es "hasta X kg"), usamos un mínimo
const PESO_MINIMO_TRAMO_PEQUENO = 1;

const getSizeMinWeight = (sizeIndex, [small, medium]) => {
  if (sizeIndex === 0) return PESO_MINIMO_TRAMO_PEQUENO;
  if (sizeIndex === 1) return small;
  return medium;
};

const BYTES_MAX_IMAGEN = 10 * 1024 * 1024;

const NIVELES_ACTIVIDAD = [
  { label: "Baja", hint: "paseos cortos" },
  { label: "Media", hint: "2 - 3 salidas" },
  { label: "Alta", hint: "necesita ejercicio" },
];

// todo: cargar a base de datos o store
const RASGOS_CARACTER = [
  "Cariñoso",
  "Tranquilo",
  "Juguetón",
  "Independiente",
  "Protector",
  "Tímido",
  "Sociable",
  "Activo",
];
const MAX_RASGOS = 4;

const MAX_LONGITUD_HISTORIA = 900;

export const ProtectoraAnimalesForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const { store, dispatch } = useGlobalReducer();
  const animalTypes = store.animalTypes;

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);

  const [loadedAnimal, setLoadedAnimal] = useState(null);
  const [loadingAnimal, setLoadingAnimal] = useState(isEditMode);
  const [loadError, setLoadError] = useState("");
  const isDraft = isEditMode && loadedAnimal?.status === "borrador";
  const prefilledRef = useRef(false);
  const initialMediaIdsRef = useRef([]);

  const speciesRef = useRef(null);
  const nameRef = useRef(null);

  const [form, setForm] = useState({
    animal_type_id: "",
    name: "",
    sex: "hembra",
    breed: "",
    weight: "",
    sizeIndex: 1,
    birthdate: "",
    unknownBirthdate: false,
    vaccines: "",
    hasMicrochip: false,
    isSterilized: false,
    testsDone: "",
    specialNeeds: "",
    activityIndex: null,
    traits: [],
    livesWithKids: null,
    livesWithDogs: null,
    livesWithCats: null,
    idealHome: "",
    story: "",
  });

  const [mediaItems, setMediaItems] = useState([]);
  const [coverId, setCoverId] = useState(null);
  const [hoveredMediaId, setHoveredMediaId] = useState(null);
  const [isDraggingMedia, setIsDraggingMedia] = useState(false);

  // en modo edición, trae el animal a actualizar
  useEffect(() => {
    if (!isEditMode) return;
    let cancelled = false;
    setLoadingAnimal(true);
    setLoadError("");

    getShelterAnimal(id)
      .then((animal) => {
        if (!cancelled) setLoadedAnimal(animal);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoadingAnimal(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, isEditMode]);

  // espera a tener el animal Y el catálogo de especies (para resaltar el animal_type_id público) antes de rellenar
  useEffect(() => {
    if (!loadedAnimal || animalTypes.length === 0 || prefilledRef.current) return;
    prefilledRef.current = true;

    const animalType = animalTypes.find((t) => t.id === loadedAnimal.animal_type_id);
    const sizeIdx = OPCIONES_TAMANO.indexOf(loadedAnimal.size);
    const activityIdx = NIVELES_ACTIVIDAD.findIndex((lvl) => lvl.label === loadedAnimal.activity_level);

    setForm({
      animal_type_id: animalType?.animal_type_id || "",
      name: loadedAnimal.name || "",
      sex: loadedAnimal.sex || "hembra",
      breed: loadedAnimal.breed || "",
      weight: loadedAnimal.weight != null ? String(Number(loadedAnimal.weight)) : "",
      sizeIndex: sizeIdx >= 0 ? sizeIdx : 1,
      birthdate: loadedAnimal.birthdate || "",
      unknownBirthdate: false,
      vaccines: loadedAnimal.vaccines || "",
      hasMicrochip: Boolean(loadedAnimal.has_microchip),
      isSterilized: Boolean(loadedAnimal.is_sterilized),
      testsDone: loadedAnimal.tests_done || "",
      specialNeeds: loadedAnimal.special_needs || "",
      activityIndex: activityIdx >= 0 ? activityIdx : null,
      traits: loadedAnimal.traits
        ? loadedAnimal.traits.split(",").map((trait) => trait.trim()).filter(Boolean)
        : [],
      livesWithKids: loadedAnimal.lives_with_kids ?? null,
      livesWithDogs: loadedAnimal.lives_with_dogs ?? null,
      livesWithCats: loadedAnimal.lives_with_cats ?? null,
      idealHome: loadedAnimal.ideal_home || "",
      story: loadedAnimal.story || "",
    });

    const media = loadedAnimal.media || [];
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
  }, [loadedAnimal, animalTypes]);

  //funcion dinamica para agrupar para todos los campos
  const handleField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const toggleBoolean = (field) => {
    setForm((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleTraitToggle = (trait) => {
    setForm((prev) => {
      const has = prev.traits.includes(trait);
      if (has) return { ...prev, traits: prev.traits.filter((t) => t !== trait) };
      if (prev.traits.length >= MAX_RASGOS) return prev;
      return { ...prev, traits: [...prev.traits, trait] };
    });
  };

  const selectedSpecies = animalTypes.find((t) => t.animal_type_id === form.animal_type_id)?.species;
  const sizeHints = PISTAS_TAMANO_POR_ESPECIE[selectedSpecies] || PISTAS_TAMANO_POR_DEFECTO;
  const sizeThresholds = UMBRALES_TAMANO_POR_ESPECIE[selectedSpecies] || UMBRALES_TAMANO_POR_DEFECTO;
  const isIdentityValid = Boolean(form.animal_type_id) && form.name.trim().length > 0;

  // Escribir el peso a mano manda: recalcula siempre el tramo de tamaño según el criterio de la especie.
  const handleWeightChange = (value) => {
    setForm((prev) => {
      const next = { ...prev, weight: value };
      const numeric = Number(value);
      if (value !== "" && !Number.isNaN(numeric)) {
        next.sizeIndex = getSizeIndexForWeight(numeric, sizeThresholds);
      }
      return next;
    });
  };

  // Elegir un tramo de tamaño solo propone un peso si el campo está vacío; si ya hay un peso, no se toca.
  const handleSizeSelect = (idx) => {
    setForm((prev) => {
      const next = { ...prev, sizeIndex: idx };
      if (prev.weight === "") {
        next.weight = String(getSizeMinWeight(idx, sizeThresholds));
      }
      return next;
    });
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

  const focusInvalidField = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    ref.current?.focus?.({ preventScroll: true });
  };

  // sube los ficheros nuevos,
  // marca la portada elegida y
  // elimina los que el usuario haya quitado del set de media.
  const syncAnimalMedia = async (animalId) => {
    const newItems = mediaItems.filter((item) => !item.isExisting);
    for (const item of newItems) {
      await uploadAnimalMedia(animalId, item.file, item.id === coverId);
    }

    const keptExisting = mediaItems.filter((item) => item.isExisting);
    const coverIsNewItem = newItems.some((item) => item.id === coverId);
    if (!coverIsNewItem && coverId && keptExisting.some((item) => item.id === coverId)) {
      await setAnimalMediaCover(animalId, coverId);
    }

    const currentExistingIds = new Set(keptExisting.map((item) => item.id));
    const removedIds = initialMediaIdsRef.current.filter((mediaId) => !currentExistingIds.has(mediaId));
    for (const mediaId of removedIds) {
      await deleteAnimalMedia(animalId, mediaId).catch(() => {});
    }
  };



  const saveAnimal = async (status) => {
    setError("");

    const nextFieldErrors = {};
    if (!form.animal_type_id) {
      nextFieldErrors.animal_type_id = "Selecciona una especie para continuar";
    }
    if (!form.name.trim()) {
      nextFieldErrors.name = "El nombre es obligatorio";
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors((prev) => ({ ...prev, ...nextFieldErrors }));
      setError("Falta completar algún dato: revisa los campos marcados en rojo.");
      focusInvalidField(nextFieldErrors.animal_type_id ? speciesRef : nameRef);
      return;
    }

    setSaving(true);
    setPendingStatus(status || null);
    try {
      const result = await createAnimal({
        ...(isEditMode ? { animal_id: id } : {}),
        ...(status ? { status } : {}),
        name: form.name.trim(),
        sex: form.sex,
        breed: form.breed.trim() || "Mestiza",
        size: OPCIONES_TAMANO[form.sizeIndex],
        weight: form.weight ? Number(form.weight) : null,
        birthdate: form.unknownBirthdate ? null : form.birthdate || null,
        activity_level: form.activityIndex != null ? NIVELES_ACTIVIDAD[form.activityIndex].label : null,
        vaccines: form.vaccines.trim(),
        has_microchip: form.hasMicrochip,
        is_sterilized: form.isSterilized,
        tests_done: form.testsDone.trim(),
        special_needs: form.specialNeeds.trim(),
        traits: form.traits,
        lives_with_kids: form.livesWithKids,
        lives_with_dogs: form.livesWithDogs,
        lives_with_cats: form.livesWithCats,
        ideal_home: form.idealHome.trim(),
        story: form.story.trim(),
        animal_type_id: form.animal_type_id,
      });

      const finalAnimalId = isEditMode ? id : result.animal_id;
      let mediaWarning = "";
      try {
        await syncAnimalMedia(finalAnimalId);
      } catch (mediaErr) {
        mediaWarning = "Se ha producido un error al guardar las fotos/vídeos: " + mediaErr.message;
      }

      const successMessage =
        (isEditMode
          ? `${form.name.trim()} se ha actualizado correctamente.`
          : status === "borrador"
            ? `${form.name.trim()} se ha guardado como borrador.`
            : `${form.name.trim()} se ha publicado correctamente.`) + mediaWarning;
      dispatch({ type: mediaWarning ? "set-error" : "set-success", payload: successMessage });
      navigate(result.location);
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
    saveAnimal(isEditMode ? undefined : "disponible");
  };

  const handleGuardarBorrador = () => {
    saveAnimal("borrador");
  };

  const handlePublicar = () => {
    saveAnimal("disponible");
  };

  return (
    <div className="container py-5">

        <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
          <div>
            <h2 className="fw-bold mb-2">{isEditMode ? "Editar animal" : "Publicar un animal"}</h2>
            {isEditMode ? (
              <p className="mb-0">Actualiza los datos de la ficha. Los cambios se guardan sobre el mismo animal.</p>
            ) : (
              <p className="mb-0">
                  La ficha se publica como <b>disponible</b>. Cuando decidáis abrir el proceso de adopción, cambiará a <b>en proceso</b>.
              </p>
            )}
          </div>
          <Link to="/panel/animales" className="btn btn-outline-secondary rounded-pill px-4">
            Volver
          </Link>
        </div>

        {loadingAnimal ? (
          <div className="text-center text-muted py-5">Cargando animal…</div>
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
                  title="Identidad"
                  subtitle="Los datos que se filtran en el buscador: especie, edad, tamaño y sexo."
                  unlocked
                >
                <div
                  ref={speciesRef}
                  tabIndex={-1}
                  className="row g-3 mb-2 pb-3"
                  style={
                    fieldErrors.animal_type_id
                      ? { outline: "2px solid var(--rp-arcilla)", outlineOffset: "0px", borderRadius: "12px" }
                      : undefined
                  }
                >
                    {animalTypes.length === 0 && <div className="col-12 text-muted">Cargando especies…</div>}
                    {animalTypes.map((type) => {
                      const especie = DATOS_ESPECIE[type.species] || {
                        emoji: "🐾",
                        description: `Ficha de ${type.species}`,
                      };
                      const selected = form.animal_type_id === type.animal_type_id;
                      return (
                        <div className="col-12 col-sm-6" key={type.animal_type_id}>
                          <button
                            type="button"
                            onClick={() => handleField("animal_type_id", type.animal_type_id)}
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
                              {especie.emoji}
                            </span>
                            <span>
                              <span className="d-block fw-bold" style={{ color: "var(--rp-pino)" }}>
                                {type.species}
                              </span>
                              <span className="d-block" style={{ color: "var(--rp-gris)", fontSize: "0.8125rem" }}>
                                {especie.description}
                              </span>
                            </span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  {fieldErrors.animal_type_id ? (
                    <div
                      className="d-flex align-items-center gap-1 mb-4"
                      style={{ color: "var(--rp-arcilla)", fontSize: "0.8rem" }}
                    >
                      <span aria-hidden="true">⚠</span> {fieldErrors.animal_type_id}
                    </div>
                  ) : (
                    <div className="mb-2" />
                  )}

          <div className="row g-3 mb-3">
            <div className="col-12 col-sm-6">
              <label className="form-label" htmlFor="name">
                Nombre
              </label>
              <input
                id="name"
                ref={nameRef}
                type="text"
                className={`form-control${fieldErrors.name ? " is-invalid" : ""}`}
                style={fieldErrors.name ? { borderColor: "var(--rp-arcilla)" } : undefined}
                placeholder="Nala"
                value={form.name}
                aria-invalid={Boolean(fieldErrors.name)}
                aria-describedby={fieldErrors.name ? "name-error" : undefined}
                onChange={(e) => handleField("name", e.target.value)}
              />
              {fieldErrors.name && (
                <div
                  id="name-error"
                  className="d-flex align-items-center gap-1 mt-1 text-danger"
                  style={{ fontSize: "0.8rem" }}
                >
                  <span aria-hidden="true">⚠</span> {fieldErrors.name}
                </div>
              )}
            </div>
            <div className="col-12 col-sm-6">
              <label className="form-label d-block">Sexo</label>
              <div className="d-flex w-100 p-1 rounded-pill" style={{ backgroundColor: "var(--rp-verde-cl)" }}>
                {["hembra", "macho"].map((option) => (
                  <button
                    type="button"
                    key={option}
                    onClick={() => handleField("sex", option)}
                    className="flex-fill border-0 rounded-pill py-2 fw-semibold text-capitalize"
                    style={{
                      backgroundColor: form.sex === option ? "var(--rp-papel)" : "transparent",
                      color: "var(--rp-pino)",
                      boxShadow: form.sex === option ? "0 1px 3px rgba(0,0,0,0.12)" : "none",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-12 col-sm-6">
              <label className="form-label" htmlFor="breed">
                Raza o mezcla
              </label>
              <input
                id="breed"
                type="text"
                className="form-control"
                placeholder="Mestiza"
                value={form.breed}
                onChange={(e) => handleField("breed", e.target.value)}
              />
            </div>
            <div className="col-12 col-sm-6">
              <label className="form-label" htmlFor="weight">
                Peso <span style={{ color: "var(--rp-gris)", fontWeight: 400 }}>kg</span>
              </label>
              <input
                id="weight"
                type="number"
                min="0"
                step="0.1"
                className="form-control"
                placeholder="14"
                value={form.weight}
                onChange={(e) => handleWeightChange(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label d-block">Tamaño</label>
            <div className="d-flex w-100 gap-1 p-1 rounded-pill" style={{ backgroundColor: "var(--rp-verde-cl)" }}>
              {OPCIONES_TAMANO.map((label, idx) => {
                const selected = idx === form.sizeIndex;
                return (
                  <button
                    type="button"
                    key={label}
                    onClick={() => handleSizeSelect(idx)}
                    className="flex-fill text-center rounded-pill py-2 px-2"
                    style={{
                      backgroundColor: selected ? "var(--rp-papel)" : "transparent",
                      border: selected ? "1px solid var(--rp-verde)" : "1px solid transparent",
                      boxShadow: selected ? "0 1px 3px rgba(0,0,0,0.12)" : "none",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <span
                      className="d-block fw-semibold"
                      style={{ color: selected ? "var(--rp-verde-osc)" : "var(--rp-pino)", fontSize: "0.9rem" }}
                    >
                      {label}
                    </span>
                    <span className="d-block" style={{ color: "var(--rp-gris)", fontSize: "0.7rem" }}>
                      {sizeHints[idx]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-0">
            <label className="form-label" htmlFor="birthdate">
              Fecha de nacimiento
            </label>
            <input
              id="birthdate"
              type="date"
              className="form-control mb-2"
              value={form.birthdate}
              disabled={form.unknownBirthdate}
              onChange={(e) => handleField("birthdate", e.target.value)}
            />
            <TogglePill
              label="No sabemos la fecha exacta"
              checked={form.unknownBirthdate}
              onClick={() => handleField("unknownBirthdate", !form.unknownBirthdate)}
            />
          </div>
                </SectionCard>

                <SectionCard
                  number={2}
                  title="Fotos y vídeos"
                  subtitle="La portada es lo primero que se ve en el buscador. Luz natural, animal centrado y sin correa tensa."
                  unlocked={isIdentityValid}
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
                        style={{fontSize: "0.6rem" }}
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
              Formatos JPG, PNG, MP4 o MOV · hasta 10 MB por foto y 60 s por vídeo. Pasa el ratón sobre una pieza para
              marcarla como portada o quitarla.
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
                  number={3}
                  title="Salud"
                  subtitle="Lo que más preguntan quienes adoptan. Ser claro aquí evita solicitudes que luego se caen."
                  unlocked={isIdentityValid}
                >
            <div className="mb-3">
              <label className="form-label" htmlFor="vaccines">
                Vacunas puestas
              </label>
              <input
                id="vaccines"
                type="text"
                className="form-control"
                placeholder="Rabia, moquillo, parvovirus…"
                value={form.vaccines}
                onChange={(e) => handleField("vaccines", e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label d-block">Estado sanitario</label>
              <div className="d-flex flex-wrap gap-2">
                <TogglePill label="Microchip" checked={form.hasMicrochip} onClick={() => toggleBoolean("hasMicrochip")} />
                <TogglePill
                  label="Esterilizado/a"
                  checked={form.isSterilized}
                  onClick={() => toggleBoolean("isSterilized")}
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="testsDone">
                Tests realizados
              </label>
              <input
                id="testsDone"
                type="text"
                className="form-control"
                placeholder="FIV/FeLV negativos…"
                value={form.testsDone}
                onChange={(e) => handleField("testsDone", e.target.value)}
              />
            </div>

            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-baseline">
                <label className="form-label mb-0" htmlFor="specialNeeds">
                  Necesidades especiales
                </label>
                <span style={{ color: "var(--rp-gris)", fontSize: "0.7rem" }}>opcional</span>
              </div>
              <textarea
                id="specialNeeds"
                className="form-control mt-1"
                rows="2"
                placeholder="Tratamiento crónico, dieta, movilidad reducida…"
                value={form.specialNeeds}
                onChange={(e) => handleField("specialNeeds", e.target.value)}
              />
            </div>

            <p className="mb-0 text-muted" style={{ fontSize: "0.8rem" }}>
              Se muestra destacado en la ficha. Decídelo desde el principio: es mejor que ocultarlo.
            </p>
                </SectionCard>

                <SectionCard
                  number={4}
                  title="Carácter y convivencia"
                  subtitle="Lo que evita devoluciones: con quién encaja y con quién no."
                  unlocked={isIdentityValid}
                >
            <div className="mb-3">
              <label className="form-label d-block">Nivel de actividad</label>
              <div className="d-flex w-100 gap-1 p-1 rounded-pill" style={{ backgroundColor: "var(--rp-verde-cl)" }}>
                {NIVELES_ACTIVIDAD.map((level, idx) => {
                  const selected = form.activityIndex === idx;
                  return (
                    <button
                      type="button"
                      key={level.label}
                      onClick={() => handleField("activityIndex", idx)}
                      className="flex-fill text-center rounded-pill py-2 px-2"
                      style={{
                        backgroundColor: selected ? "var(--rp-papel)" : "transparent",
                        border: selected ? "1px solid var(--rp-verde)" : "1px solid transparent",
                        boxShadow: selected ? "0 1px 3px rgba(0,0,0,0.12)" : "none",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <span
                        className="d-block fw-semibold"
                        style={{ color: selected ? "var(--rp-verde-osc)" : "var(--rp-pino)", fontSize: "0.9rem" }}
                      >
                        {level.label}
                      </span>
                      <span className="d-block" style={{ color: "var(--rp-gris)", fontSize: "0.7rem" }}>
                        {level.hint}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-baseline mb-2">
                <label className="form-label mb-0">Carácter</label>
                <span style={{ color: "var(--rp-gris)", fontSize: "0.7rem" }}>elige hasta {MAX_RASGOS}</span>
              </div>
              <div className="d-flex flex-wrap gap-2">
                {RASGOS_CARACTER.map((trait) => {
                  const selected = form.traits.includes(trait);
                  const disabled = !selected && form.traits.length >= MAX_RASGOS;
                  return (
                    <button
                      type="button"
                      key={trait}
                      onClick={() => handleTraitToggle(trait)}
                      disabled={disabled}
                      className="rounded-pill border px-3 py-1"
                      style={{
                        borderColor: selected ? "var(--rp-verde)" : "var(--rp-linea)",
                        backgroundColor: selected ? "var(--rp-verde-cl)" : "var(--rp-papel)",
                        color: selected ? "var(--rp-verde-osc)" : "var(--rp-pino)",
                        fontSize: "0.8rem",
                        opacity: disabled ? 0.5 : 1,
                        transition: "all 0.15s ease",
                      }}
                    >
                      {trait}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label d-block">Convivencia</label>
              <p className="mb-2 text-muted" style={{ fontSize: "0.75rem" }}>
                «Sin valorar» es una respuesta válida y honesta: se publica tal cual.
              </p>
              <div className="d-flex flex-column gap-2">
                <SiNoUndefinedRow
                  label="Con niños"
                  value={form.livesWithKids}
                  onChange={(v) => handleField("livesWithKids", v)}
                />
                <SiNoUndefinedRow
                  label="Con perros"
                  value={form.livesWithDogs}
                  onChange={(v) => handleField("livesWithDogs", v)}
                />
                <SiNoUndefinedRow
                  label="Con gatos"
                  value={form.livesWithCats}
                  onChange={(v) => handleField("livesWithCats", v)}
                />
              </div>
            </div>

            <div className="mb-0">
              <div className="d-flex justify-content-between align-items-baseline">
                <label className="form-label mb-0" htmlFor="idealHome">
                  Hogar ideal
                </label>
                <span style={{ color: "var(--rp-gris)", fontSize: "0.7rem" }}>opcional</span>
              </div>
              <textarea
                id="idealHome"
                className="form-control mt-1"
                rows="2"
                placeholder="Casa con jardín, familia tranquila…"
                value={form.idealHome}
                onChange={(e) => handleField("idealHome", e.target.value)}
              />
            </div>
                </SectionCard>

                <SectionCard
                  number={5}
                  title="Su historia"
                  subtitle="El texto que hace que alguien se pare. Concreto, sin dramatismo: de dónde viene, cómo es un día con él y qué necesita."
                  unlocked={isIdentityValid}
                >
            <div className="mb-0">
              <div className="d-flex justify-content-between align-items-baseline">
                <label className="form-label mb-0" htmlFor="story">
                  Historia
                </label>
                <span style={{ color: "var(--rp-gris)", fontSize: "0.7rem" }}>
                  {form.story.length}/{MAX_LONGITUD_HISTORIA}
                </span>
              </div>
              <textarea
                id="story"
                className="form-control mt-1"
                rows="4"
                maxLength={MAX_LONGITUD_HISTORIA}
                placeholder="Nala llegó en marzo tras un abandono en la huerta. Los primeros días no salía de la caseta, ahora es la primera en pedir paseo y duerme boca arriba…"
                value={form.story}
                onChange={(e) => handleField("story", e.target.value)}
              />
            </div>
                </SectionCard>
            </div>

            <div className="col-md-3 mb-5 mt-3 mt-md-0 order-2">
                <LivePreviewCard
                  species={selectedSpecies}
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
                  {saving && pendingStatus === "borrador" ? "Guardando…" : "Guardar como borrador"}
                </button>
              )}
              <button
                type="submit"
                className={`btn rounded-pill px-4 ${isDraft ? "btn-outline-secondary" : "btn-success"}`}
                disabled={saving}
              >
                {saving && pendingStatus === (isEditMode ? null : "disponible")
                  ? "Guardando…"
                  : isEditMode
                    ? isDraft
                      ? "Guardar borrador"
                      : "Actualizar"
                    : "Publicar animal"}
              </button>
              {isDraft && (
                <button
                  type="button"
                  className="btn btn-success rounded-pill px-4"
                  disabled={saving}
                  onClick={handlePublicar}
                >
                  {saving && pendingStatus === "disponible" ? "Publicando…" : "Publicar"}
                </button>
              )}
            </div>
        </div>
        </form>
        )}
    </div>
  );
};
