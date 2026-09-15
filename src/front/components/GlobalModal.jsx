import { useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";

const VARIANTS = {
  success: {
    iconBg: "var(--rp-verde)",
    title: "¡Listo!",
    buttonClass: "btn-success",
  },
  error: {
    iconBg: "var(--rp-arcilla)",
    title: "Ha ocurrido un error",
    buttonClass: "btn-outline-danger",
  },
};

export const GlobalModal = () => {
  const { store, dispatch } = useGlobalReducer();

  const isSuccess = Boolean(store.successMessage);
  const message = store.successMessage || store.errorMessage;
  const variant = isSuccess ? VARIANTS.success : VARIANTS.error;
  const clearAction = isSuccess ? "set-success" : "set-error";

  const close = () => dispatch({ type: clearAction, payload: null });

  useEffect(() => {
    if (!message) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);

  if (!message) return null;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
      style={{ backgroundColor: "rgba(18, 33, 28, 0.55)", zIndex: 1080 }}
      onClick={close}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-live="assertive"
        className="bg-white rounded-4 shadow p-4 text-center"
        style={{ maxWidth: "420px", width: "100%" }}
        onClick={(e) => e.stopPropagation()}
      >
        <span
          className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
          style={{ width: "56px", height: "56px", backgroundColor: variant.iconBg }}
        >
          {isSuccess ? (
            <svg width="24" height="18" viewBox="0 0 24 18" fill="none" aria-hidden="true">
              <path d="M2 9L9 16L22 2" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <span className="text-white fw-bold" style={{ fontSize: "1.5rem", lineHeight: 1 }} aria-hidden="true">
              !
            </span>
          )}
        </span>

        <h5 className="fw-bold mb-2">{variant.title}</h5>
        <p className="text-muted mb-4">{message}</p>

        <button type="button" className={`btn ${variant.buttonClass} rounded-pill w-100`} onClick={close}>
          Aceptar
        </button>
      </div>
    </div>
  );
};
