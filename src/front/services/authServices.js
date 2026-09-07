const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const login = async (usuario, password) => {

    const response = await fetch(`${BACKEND_URL.replace(/\/$/, "")}/api/login`, {
        method: "POST",
        body: JSON.stringify({
            usuario: usuario,
            password: password,
        }),
        headers: {
            "Content-Type": "application/json",
        },
    });

    const data = await response.json();
    if (!response.ok) {
        const errorMessage = data.error || data.message || "El correo o la contraseña no son correctos";
        throw new Error(errorMessage);
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    return {
        token: data.token,
        user: data.user,
    };
};

export const logout = async () => {
    //llamada a backend
    try {
        const response = await fetch(`${BACKEND_URL.replace(/\/$/, "")}/api/logout`, {
            method: "POST",
            body: JSON.stringify({
                token: localStorage.getItem("token")
            }),
            headers: {
                Authorization: `Bearer ${getToken()}`,
                "Content-Type": "application/json",
            },
        });

        const data = await response.json();
        if (!response.ok) {
            const errorMessage = data.error || data.message || "Error al cerrar sesión";
            throw new Error(errorMessage);
        }
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
    }

    limpiarSession();
};

export const limpiarSession = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
};

export const fetchProfile = async () => {
    const response = await fetch(`${BACKEND_URL.replace(/\/$/, "")}/api/profile`, {
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });

    const data = await response.json();
    if (!response.ok) {
        const error = new Error(data.error || data.message || "No se ha podido obtener el perfil");
        error.status = response.status;
        throw error;
    }

    localStorage.setItem("user", JSON.stringify(data));

    return data;
};

export const getToken = () => {
    return localStorage.getItem("token")||null;
};

export const getUser = () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
};