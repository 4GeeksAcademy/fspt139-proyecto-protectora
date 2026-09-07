export const UserAvatar = ({user}) => {
    const nombreCompleto = user ? `${user.name} ${user.last_name1}`.trim() : "";
    const iniciales = user ? `${user.name?.[0] ?? ""}${user.last_name1?.[0] ?? ""}`.toUpperCase() : "";

    //si en el futuro añadimos imagen, reemplazar esto

    return <>
        <span className="fw-semibold text-primary">{nombreCompleto}</span>
        <span className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold bg-primary"
            style={{width: "28px", height: "28px", fontSize: "0.75rem"}}>{iniciales}</span>

        </>
};