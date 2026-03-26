// payment-gateway/src/components/PaymentReturn.jsx
// Cashfree payment ke baad yahan aata hai → verify karo → main app pe redirect karo

import { useEffect, useState } from "react";

const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";
const MAIN_APP = import.meta.env.VITE_MAIN_APP_URL || "http://localhost:5173";

const G = {
    gold: "#D4A847",
    bright: "#F0C96A",
    bg: "#070604",
    border: "#D4A84728",
};

export default function PaymentReturn() {
    const [status, setStatus] = useState("verifying"); // verifying | success | failed

    useEffect(() => {
        verifyPayment();
    }, []);

    const verifyPayment = async () => {
        const params = new URLSearchParams(window.location.search);
        const orderId = params.get("order_id");

        if (!orderId) {
            setStatus("failed");
            setTimeout(() => {
                window.location.href = `${MAIN_APP}/failed`;
            }, 2000);
            return;
        }

        try {
            // Backend se payment verify karo
            const res = await fetch(`${API}/verify-payment/${orderId}`);
            const data = await res.json();

            if (data.status === "PAID") {
                // ✅ Payment successful
                setStatus("success");
                // 2 second baad main app ke success page pe bhejo
                setTimeout(() => {
                    window.location.href = `${MAIN_APP}/deposit/success?txnId=${orderId}&status=success`;
                }, 2000);
            } else {
                // ❌ Payment failed ya pending
                setStatus("failed");
                setTimeout(() => {
                    // Failed case:
                    window.location.href = `${MAIN_APP}/deposit?payment=failed`;
                }, 2500);
            }
        } catch (err) {
            console.error("Verification error:", err);
            setStatus("failed");
            setTimeout(() => {
                window.location.href = `${MAIN_APP}/failed`;
            }, 2500);
        }
    };

    // Verifying screen
    if (status === "verifying") {
        return (
            <div style={styles.container}>
                <div style={styles.ambientBlue} />
                <div style={{ position: "relative", zIndex: 10, textAlign: "center" }}>
                    <div style={styles.spinner} />
                    <style>{`
            @keyframes spin { to { transform: rotate(360deg); } }
            @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
          `}</style>
                    <div style={{ fontSize: "13px", letterSpacing: "4px", color: G.gold, marginBottom: "8px" }}>
                        VERIFYING PAYMENT
                    </div>
                    <div style={{ fontSize: "9px", letterSpacing: "2px", color: "#D4A84760" }}>
                        Please wait, do not close this page...
                    </div>
                </div>
            </div>
        );
    }

    // Success screen
    if (status === "success") {
        return (
            <div style={styles.container}>
                <div style={styles.ambientGreen} />
                <div
                    style={{
                        position: "relative", zIndex: 10, textAlign: "center",
                        animation: "fadeIn 0.5s ease-out",
                    }}
                >
                    <style>{`@keyframes fadeIn { from { opacity:0; transform:scale(0.9); } to { opacity:1; transform:scale(1); } }`}</style>

                    {/* Checkmark */}
                    <div style={{
                        width: "72px", height: "72px", borderRadius: "50%",
                        background: "#22c55e22", border: "2px solid #22c55e",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        margin: "0 auto 24px", fontSize: "32px",
                    }}>
                        ✓
                    </div>

                    <div style={{ fontSize: "13px", letterSpacing: "4px", color: "#22c55e", marginBottom: "8px" }}>
                        PAYMENT SUCCESSFUL
                    </div>
                    <div style={{ fontSize: "9px", letterSpacing: "2px", color: "#D4A84760" }}>
                        Redirecting you back to the game...
                    </div>
                </div>
            </div>
        );
    }

    // Failed screen
    return (
        <div style={styles.container}>
            <div style={styles.ambientRed} />
            <div style={{ position: "relative", zIndex: 10, textAlign: "center" }}>
                <div style={{
                    width: "72px", height: "72px", borderRadius: "50%",
                    background: "#ef444422", border: "2px solid #ef4444",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 24px", fontSize: "32px", color: "#ef4444",
                }}>
                    ✕
                </div>

                <div style={{ fontSize: "13px", letterSpacing: "4px", color: "#ef4444", marginBottom: "8px" }}>
                    PAYMENT FAILED
                </div>
                <div style={{ fontSize: "9px", letterSpacing: "2px", color: "#D4A84760" }}>
                    Redirecting you back...
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: "100vh",
        background: G.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Space Mono', monospace",
    },
    spinner: {
        width: "56px",
        height: "56px",
        border: `2px solid ${G.gold}`,
        borderRadius: "50%",
        borderTopColor: "transparent",
        animation: "spin 1s linear infinite",
        margin: "0 auto 24px",
    },
    ambientBlue: {
        position: "fixed", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 60% 50% at 50% 40%,#3b82f612,transparent 70%)",
    },
    ambientGreen: {
        position: "fixed", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 60% 50% at 50% 40%,#22c55e18,transparent 70%)",
    },
    ambientRed: {
        position: "fixed", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 60% 50% at 50% 40%,#ef444418,transparent 70%)",
    },
};