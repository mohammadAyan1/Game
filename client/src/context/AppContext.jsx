// src/context/AppContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";

const AppContext = createContext();

export const AppProvider = ({ children }) => {

    const [coin, setCoin] = useState(0);
    const [user, setUser] = useState(null);

    // ✅ FIX: true rakho — taaki refresh pe UserRoute turant /login na bheje
    //    pehle API call complete ho, phir route decide ho
    const [loading, setLoading] = useState(true);

    // ─────────────────────────────────────────────
    // FETCH USER
    // ─────────────────────────────────────────────
    const fetchUser = async () => {
        try {
            const res = await api.get("/checkuser");
            setUser(res?.data);
        } catch (err) {
            console.log(err);
            setUser(null);
        }
    };

    // ─────────────────────────────────────────────
    // LOGOUT
    // ─────────────────────────────────────────────
    const logout = async () => {
        try {
            const res = await api.get("/auth/logout");
            console.log(res);
            setUser(null);
        } catch (error) {
            console.log(error);
        }
    };

    // ─────────────────────────────────────────────
    // FETCH COINS
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
    // INIT LOAD — ek baar
    // ─────────────────────────────────────────────
    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await fetchUser();   // pehle user check
            await fetchCoins();  // phir coins
            setLoading(false);   // ab routes decide honge
        };
        init();
    }, []);

    return (
        <AppContext.Provider
            value={{
                coin,
                user,
                loading,
                fetchCoins,
                fetchUser,
                setCoin,
                setUser,
                refreshCoins,
                logout,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);