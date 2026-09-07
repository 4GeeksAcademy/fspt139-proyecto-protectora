// Cierra manualmente un navbar-collapse de Bootstrap tras navegar por un link.
// No usamos data-bs-toggle en los propios links: Bootstrap intercepta y hace
// preventDefault en el click de cualquier <a> con ese atributo, lo que impedía
// que react-router-dom completara la navegación.
export const closeCollapse = (collapseId) => {
    const el = document.getElementById(collapseId);
    if (!el || !el.classList.contains("show")) return;

    const instance = window.bootstrap?.Collapse.getOrCreateInstance(el, { toggle: false });
    instance?.hide();
};
