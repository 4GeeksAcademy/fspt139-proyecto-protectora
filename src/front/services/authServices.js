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
        const errorMessage = data.error || "El correo o la contraseña no son correctos";
        throw new Error(errorMessage);
    }

    sessionStorage.setItem("token", data.token);
    sessionStorage.setItem("user", JSON.stringify(data.user));

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
                token: sessionStorage.getItem("token")
            }),
            headers: {
                Authorization: `Bearer ${getToken()}`,
                "Content-Type": "application/json",
            },
        });

        const data = await response.json();
        if (!response.ok) {
            const errorMessage = data.error || "El correo o la contraseña no son correctos";
            throw new Error(errorMessage);
        }
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
    }


    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

};

export const getToken = () => {
    return sessionStorage.getItem("token")||null;
};

export const getUser = () => {
    const user = sessionStorage.getItem("user");
    return user ? JSON.parse(user) : null;
};