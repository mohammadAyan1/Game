// src/routes/AdminRoute.jsx
import { Navigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

const AdminRoute = ({ children }) => {
    const { user, loading } = useApp();

    // ✅ FIX: Loading ke dauran wait karo
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

    // ✅ User nahi → Login
    if (!user) return <Navigate to="/login" replace />;

    // ✅ User hai lekin Admin nahi → Home (normal user admin route nahi access kar sakta)
    if (user.role !== "Admin") return <Navigate to="/" replace />;

    return children;
};

export default AdminRoute;