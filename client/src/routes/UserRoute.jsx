// src/routes/UserRoute.jsx
import { Navigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

const UserRoute = ({ children }) => {
    const { user, loading } = useApp();

    // ✅ FIX: Loading ke dauran kuch mat karo — API complete hone do
    if (loading) return (
        <div style={{
            minHeight: '100vh',
            background: '#050403',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 16,
        }}>
            <div style={{ fontSize: 42, animation: 'pulse 1.5s ease-in-out infinite' }}>♛</div>
            <p style={{
                color: '#D4A847',
                fontFamily: 'Cinzel, serif',
                letterSpacing: 3,
                fontSize: 13,
            }}>LOADING...</p>
        </div>
    );

    // ✅ Loading khatam, ab check karo — user nahi hai toh login
    if (!user) return <Navigate to="/login" replace />;

    return children;
};

export default UserRoute;