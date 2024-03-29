import { createContext, useContext } from "react";

import { useState } from "react";
import { api } from "../services/api";
import { useEffect } from "react";

export const AuthContext = createContext({});

function AuthProvider({ children }) {

    const [data, setData] = useState({});
    const [loading, setLoading] = useState(false);

    async function signIn({email, password}) {

        try {
            const response = await api.post("/sessions", {email, password});
            const {user, token} = response.data;

            localStorage.setItem("@screenScore:user", JSON.stringify(user));
            localStorage.setItem("@screenScore:token", token);

            api.defaults.headers.common['authorization'] = `Bearer ${token}`;

            setData({user, token});

        } catch(error) {
            if(error.response) {
                alert(error.response.data.message)
            } else {
                alert("Não foi possível conectar")
                console.log(error)
            }
        }
        
    }

    function signOut() {
        localStorage.removeItem("@screenScore:user");
        localStorage.removeItem("@screenScore:token");

        setData({});
    }

    async function updateProfile({ user, avatarFile }) {
        try {
            if(avatarFile) {
                const fileUploadForm = new FormData();
                fileUploadForm.append("avatar", avatarFile);

                const response = await api.patch("/users/avatar", fileUploadForm);
                user.avatar = response.data.avatar;
            }

            await api.put("/users", user);
            localStorage.setItem("@screenScore:user", JSON.stringify(user));
            setData({user, token: data.token});

            alert("dados atualizado com sucesso!")

        } catch(error) {
            if(error.response) {
                alert(error.response.data.message)
            } else {
                alert("Não foi possível atualizar o perfil.")
                console.log(error)
            }
        }
    }


    useEffect(() => {
        const token = localStorage.getItem("@screenScore:token");
        const user = localStorage.getItem("@screenScore:user");

        api.defaults.headers.common['authorization'] = `Bearer ${token}`;
        
        if(token && user) {
            setData({
                token,
                user: JSON.parse(user)
            });
        }


    }, [])

    return (
        <AuthContext.Provider value={{
            signIn,
            signOut,
            updateProfile,
            user: data.user,
            loading
            }}>
            {children}
        </AuthContext.Provider>
    )
}

function useAuth() {
    const context = useContext(AuthContext);

    return context;
}

export { AuthProvider, useAuth };