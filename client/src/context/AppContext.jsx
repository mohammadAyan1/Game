// src/context/AppContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";

const AppContext = createContext();

export const AppProvider = ({ children }) => {

    // 🔥 GLOBAL STATES
    const [coin, setCoin] = useState(0);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);

    // ─────────────────────────────────────────────
    // 🔹 FETCH USER
    // ─────────────────────────────────────────────
    const fetchUser = async () => {
        try {
            const res = await api.get("/checkuser");
            setUser(res?.data);
        } catch (err) {
            setUser(null);
        }
    };

    // ─────────────────────────────────────────────
    // 🔹 FETCH COINS
    // ─────────────────────────────────────────────
    const fetchCoins = async () => {
        try {
            const res = await api.get("/wallet/get-total-coin");
            setCoin(res?.data?.totalCoins || 0);
        } catch (err) {
            console.log(err);
        }
    };


    const refreshCoins = async () => {
        try {
            const res = await api.get("/wallet/get-total-coin");
            setCoin(res?.data?.totalCoins || 0);
        } catch (err) {
            console.log(err);
        }
    };

    // ─────────────────────────────────────────────
    // 🔹 INIT LOAD (ONLY ONCE)
    // ─────────────────────────────────────────────
    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await fetchUser();
            await fetchCoins();
            setLoading(false);
        };

        init();
    }, []);

    // ─────────────────────────────────────────────
    // 🔹 EXPOSE EVERYTHING
    // ─────────────────────────────────────────────
    return (
        <AppContext.Provider
            value={{
                coin,
                user,
                loading,
                fetchCoins,
                fetchUser,
                setCoin,   // future use
                setUser,
                refreshCoins
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

// 🔥 CUSTOM HOOK
export const useApp = () => useContext(AppContext);