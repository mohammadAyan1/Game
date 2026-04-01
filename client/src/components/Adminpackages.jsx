// import { useState, useEffect } from "react";
// import api from "../utils/api.js"
// // ── Config ──────────────────────────────────────────────────────────────────
// // const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// // ── Helpers ─────────────────────────────────────────────────────────────────
// const fmt = (n) => Number(n || 0).toLocaleString("en-IN");

// // function getToken() {
// //     return localStorage.getItem("token") || "";
// // }

// // const authHeaders = () => ({
// //     "Content-Type": "application/json",
// //     Authorization: `Bearer ${getToken()}`,
// // });

// // ── Toast ────────────────────────────────────────────────────────────────────



// function useToast() {
//     const [toasts, setToasts] = useState([]);
//     const add = (msg, type = "success") => {
//         const id = Date.now();
//         setToasts((p) => [...p, { id, msg, type }]);
//         setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
//     };
//     return { toasts, success: (m) => add(m, "success"), error: (m) => add(m, "error") };
// }

// function Toasts({ toasts }) {
//     return (
//         <div style={{ position: "fixed", top: 80, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8, fontFamily: "'Space Mono',monospace" }}>
//             {toasts.map((t) => (
//                 <div key={t.id} style={{
//                     padding: "11px 18px", borderRadius: 10, fontSize: 11, letterSpacing: ".5px",
//                     background: t.type === "success" ? "#22c55e18" : "#ef444418",
//                     border: `1px solid ${t.type === "success" ? "#22c55e45" : "#ef444445"}`,
//                     color: t.type === "success" ? "#22c55e" : "#ef4444",
//                     boxShadow: "0 8px 32px #00000060",
//                     animation: "gpFadeSlide .3s ease forwards",
//                 }}>
//                     {t.type === "success" ? "✓" : "✕"}&nbsp;&nbsp;{t.msg}
//                 </div>
//             ))}
//         </div>
//     );
// }

// // ── Delete Confirm Modal ─────────────────────────────────────────────────────
// function DeleteModal({ pkg, onConfirm, onClose }) {
//     if (!pkg) return null;
//     return (
//         <div onClick={(e) => e.target === e.currentTarget && onClose()}
//             style={{ position: "fixed", inset: 0, zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(4,3,2,.85)", backdropFilter: "blur(8px)", fontFamily: "'Space Mono',monospace" }}>
//             <div style={{ position: "relative", width: 340, borderRadius: 16, border: "1px solid #D4A84728", background: "linear-gradient(160deg,#0E0B08,#090705)", boxShadow: "0 0 0 1px #D4A84710 inset,0 40px 100px #000000A0", overflow: "hidden", padding: "32px 28px 28px", animation: "gpSlideUp .25s cubic-bezier(.16,1,.3,1) forwards" }}>
//                 <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent 5%,#8B6914 25%,#D4A847 50%,#8B6914 75%,transparent 95%)" }} />
//                 <div style={{ textAlign: "center", marginBottom: 20 }}>
//                     <div style={{ fontSize: 28, marginBottom: 12 }}>🗑️</div>
//                     <div style={{ fontFamily: "'Cinzel',serif", fontSize: 16, fontWeight: 900, color: "#ef4444", letterSpacing: 3, marginBottom: 8 }}>DELETE PACKAGE</div>
//                     <p style={{ fontSize: 11, color: "#D4A84760", lineHeight: 1.8, letterSpacing: ".5px" }}>
//                         Are you sure you want to delete<br />
//                         <span style={{ color: "#D4A847", fontWeight: 700 }}>"{pkg.label}"</span> package?<br />
//                         This action cannot be undone.
//                     </p>
//                 </div>
//                 <div style={{ display: "flex", gap: 10 }}>
//                     <button onClick={onConfirm} style={{ flex: 1, padding: "11px", borderRadius: 8, background: "#ef444412", border: "1px solid #ef444435", color: "#ef4444", fontSize: 10, fontWeight: 700, letterSpacing: "2.5px", fontFamily: "'Space Mono',monospace", cursor: "pointer" }}>
//                         DELETE
//                     </button>
//                     <button onClick={onClose} style={{ flex: 1, padding: "11px", borderRadius: 8, background: "#D4A84710", border: "1px solid #D4A84730", color: "#D4A847", fontSize: 10, fontWeight: 700, letterSpacing: "2.5px", fontFamily: "'Space Mono',monospace", cursor: "pointer" }}>
//                         CANCEL
//                     </button>
//                 </div>
//                 <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent 5%,#8B691440 30%,#D4A84725 50%,#8B691440 70%,transparent 95%)" }} />
//             </div>
//         </div>
//     );
// }

// // ── Package Form Modal (Create / Edit) ───────────────────────────────────────
// const EMPTY_FORM = { rupees: "", coins: "", bonus: "", pct: "", label: "", tag: "", popular: false };

// function PackageModal({ mode, initial, onSave, onClose }) {
//     const [form, setForm] = useState(initial || EMPTY_FORM);
//     const [loading, setLoading] = useState(false);
//     const [errors, setErrors] = useState({});

//     const update = (k) => (e) =>
//         setForm((p) => ({ ...p, [k]: k === "popular" ? e.target.checked : e.target.value }));

//     const validate = () => {
//         const e = {};
//         if (!form.label?.trim()) e.label = "Label is required";
//         if (!form.rupees || form.rupees <= 0) e.rupees = "Enter valid amount";
//         if (!form.coins || form.coins <= 0) e.coins = "Enter valid coins";
//         if (!form.bonus || form.bonus < 0) e.bonus = "Enter valid bonus";
//         if (!form.pct?.trim()) e.pct = "Enter percentage e.g. 30%";
//         return e;
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         const errs = validate();
//         if (Object.keys(errs).length) { setErrors(errs); return; }
//         setLoading(true);
//         await onSave({ ...form, rupees: Number(form.rupees), coins: Number(form.coins), bonus: Number(form.bonus), popular: !!form.popular });
//         setLoading(false);
//     };

//     const inputStyle = (err) => ({
//         width: "100%", padding: "10px 14px", background: "#D4A84710",
//         border: `1px solid ${err ? "#ef444440" : "#D4A84730"}`,
//         borderRadius: 8, color: "#D4A847", fontSize: 13, fontWeight: 700,
//         fontFamily: "'Space Mono',monospace", outline: "none", boxSizing: "border-box",
//     });

//     const labelStyle = { fontSize: 9, letterSpacing: "3px", color: "#D4A84770", fontFamily: "'Space Mono',monospace", display: "block", marginBottom: 6 };

//     return (
//         <div onClick={(e) => e.target === e.currentTarget && onClose()}
//             style={{ position: "fixed", inset: 0, zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(4,3,2,.85)", backdropFilter: "blur(8px)", fontFamily: "'Space Mono',monospace", padding: 16 }}>
//             <div style={{ position: "relative", width: "100%", maxWidth: 500, maxHeight: "90vh", overflowY: "auto", borderRadius: 18, border: "1px solid #D4A84728", background: "linear-gradient(160deg,#0E0B08,#090705)", boxShadow: "0 0 0 1px #D4A84710 inset,0 50px 120px #000000A0", overflow: "hidden", animation: "gpSlideUp .25s cubic-bezier(.16,1,.3,1) forwards" }}>
//                 <div style={{ position: "sticky", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent 5%,#8B6914 25%,#D4A847 50%,#8B6914 75%,transparent 95%)", zIndex: 1 }} />

//                 <div style={{ padding: "28px 28px 24px" }}>
//                     {/* Header */}
//                     <div style={{ textAlign: "center", marginBottom: 24 }}>
//                         <div style={{ fontSize: 9, letterSpacing: "5px", color: "#D4A84750", marginBottom: 8 }}>
//                             {mode === "create" ? "NEW PACKAGE" : "EDIT PACKAGE"}
//                         </div>
//                         <div style={{ fontFamily: "'Cinzel',serif", fontSize: 18, fontWeight: 900, color: "#D4A847", letterSpacing: 4 }}>
//                             {mode === "create" ? "CREATE PACKAGE" : `EDIT — ${initial?.label}`}
//                         </div>
//                     </div>

//                     <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

//                         {/* Label */}
//                         <div>
//                             <label style={labelStyle}>PACKAGE LABEL *</label>
//                             <input placeholder="e.g. STARTER, ELITE, ROYAL" value={form.label} onChange={update("label")} style={inputStyle(errors.label)} />
//                             {errors.label && <span style={{ fontSize: 10, color: "#ef4444", marginTop: 4, display: "block" }}>{errors.label}</span>}
//                         </div>

//                         {/* Rupees + Coins */}
//                         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
//                             <div>
//                                 <label style={labelStyle}>PRICE (₹) *</label>
//                                 <input type="number" placeholder="100" value={form.rupees} onChange={update("rupees")} style={inputStyle(errors.rupees)} min="1" />
//                                 {errors.rupees && <span style={{ fontSize: 10, color: "#ef4444", marginTop: 4, display: "block" }}>{errors.rupees}</span>}
//                             </div>
//                             <div>
//                                 <label style={labelStyle}>COINS *</label>
//                                 <input type="number" placeholder="130" value={form.coins} onChange={update("coins")} style={inputStyle(errors.coins)} min="1" />
//                                 {errors.coins && <span style={{ fontSize: 10, color: "#ef4444", marginTop: 4, display: "block" }}>{errors.coins}</span>}
//                             </div>
//                         </div>

//                         {/* Bonus + Pct */}
//                         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
//                             <div>
//                                 <label style={labelStyle}>BONUS COINS *</label>
//                                 <input type="number" placeholder="30" value={form.bonus} onChange={update("bonus")} style={inputStyle(errors.bonus)} min="0" />
//                                 {errors.bonus && <span style={{ fontSize: 10, color: "#ef4444", marginTop: 4, display: "block" }}>{errors.bonus}</span>}
//                             </div>
//                             <div>
//                                 <label style={labelStyle}>PERCENTAGE *</label>
//                                 <input placeholder="30%" value={form.pct} onChange={update("pct")} style={inputStyle(errors.pct)} />
//                                 {errors.pct && <span style={{ fontSize: 10, color: "#ef4444", marginTop: 4, display: "block" }}>{errors.pct}</span>}
//                             </div>
//                         </div>

//                         {/* Tag (optional) */}
//                         <div>
//                             <label style={labelStyle}>TAG (OPTIONAL)</label>
//                             <input placeholder="e.g. POPULAR, BEST VALUE, 🔥 HOT" value={form.tag} onChange={update("tag")} style={inputStyle(false)} />
//                             <span style={{ fontSize: 9, color: "#D4A84750", marginTop: 4, display: "block", letterSpacing: "1px" }}>
//                                 Leave empty for no tag banner
//                             </span>
//                         </div>

//                         {/* Popular toggle */}
//                         <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "#D4A84708", borderRadius: 8, border: "1px solid #D4A84720" }}>
//                             <button type="button"
//                                 onClick={() => setForm((p) => ({ ...p, popular: !p.popular }))}
//                                 style={{
//                                     width: 20, height: 20, borderRadius: 5, border: `1px solid ${form.popular ? "#D4A847" : "#D4A84740"}`,
//                                     background: form.popular ? "#D4A84725" : "transparent", cursor: "pointer",
//                                     display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
//                                 }}>
//                                 {form.popular && (
//                                     <svg width="11" height="11" viewBox="0 0 10 10">
//                                         <path d="M1.5 5L4 7.5L8.5 2.5" stroke="#D4A847" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
//                                     </svg>
//                                 )}
//                             </button>
//                             <div>
//                                 <div style={{ fontSize: 10, color: "#D4A847", letterSpacing: "2px", fontWeight: 700 }}>MARK AS POPULAR</div>
//                                 <div style={{ fontSize: 9, color: "#D4A84760", letterSpacing: "1px", marginTop: 2 }}>Highlighted with special styling on deposit page</div>
//                             </div>
//                         </div>

//                         {/* Divider */}
//                         <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "4px 0" }}>
//                             <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,transparent,#D4A84730)" }} />
//                             <svg width="12" height="12" viewBox="0 0 12 12"><polygon points="6,1 11,6 6,11 1,6" fill="#D4A84718" stroke="#D4A847" strokeWidth=".7" /></svg>
//                             <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,#D4A84730,transparent)" }} />
//                         </div>

//                         {/* Submit */}
//                         <div style={{ display: "flex", gap: 10 }}>
//                             <button type="submit" disabled={loading}
//                                 style={{
//                                     flex: 2, padding: "13px", borderRadius: 8, cursor: loading ? "not-allowed" : "pointer",
//                                     background: loading ? "#D4A84718" : "linear-gradient(135deg,#B8860B,#D4A847,#F0C96A,#D4A847,#B8860B)",
//                                     border: "none", color: loading ? "#D4A84760" : "#150F00",
//                                     fontSize: 11, fontWeight: 700, letterSpacing: "3px", fontFamily: "'Space Mono',monospace",
//                                 }}>
//                                 {loading ? "SAVING..." : mode === "create" ? "CREATE PACKAGE" : "SAVE CHANGES"}
//                             </button>
//                             <button type="button" onClick={onClose} disabled={loading}
//                                 style={{ flex: 1, padding: "13px", borderRadius: 8, background: "transparent", border: "1px solid #D4A84730", color: "#D4A84770", fontSize: 10, fontWeight: 700, letterSpacing: "2px", fontFamily: "'Space Mono',monospace", cursor: "pointer" }}>
//                                 CANCEL
//                             </button>
//                         </div>
//                     </form>
//                 </div>

//                 <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent 5%,#8B691440 30%,#D4A84725 50%,#8B691440 70%,transparent 95%)" }} />
//             </div>
//         </div>
//     );
// }

// // ── Package Card ─────────────────────────────────────────────────────────────
// function PackageCard({ pkg, onEdit, onDelete }) {
//     const [hovered, setHovered] = useState(false);
//     const c = pkg.popular ? "#F0C96A" : "#D4A847";

//     return (
//         <div
//             onMouseEnter={() => setHovered(true)}
//             onMouseLeave={() => setHovered(false)}
//             style={{
//                 position: "relative", borderRadius: 14, padding: "20px 18px",
//                 border: `1px solid ${hovered ? c + "55" : "#D4A84728"}`,
//                 background: hovered ? `linear-gradient(160deg,${c}10,${c}05)` : "linear-gradient(160deg,#0E0B08,#090705)",
//                 boxShadow: hovered ? `0 16px 48px #00000080,0 0 30px ${c}15` : "0 4px 20px #00000050",
//                 transform: hovered ? "translateY(-4px)" : "translateY(0)",
//                 transition: "all .25s cubic-bezier(.16,1,.3,1)",
//                 fontFamily: "'Space Mono',monospace",
//             }}>

//             {/* Top shimmer */}
//             <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${c}30,transparent)`, opacity: hovered ? 1 : 0, transition: "opacity .25s" }} />

//             {/* Tag */}
//             {pkg.tag && (
//                 <div style={{ position: "absolute", top: -10, left: 16, background: pkg.popular ? "linear-gradient(135deg,#B8860B,#D4A847,#F0C96A)" : `${c}22`, border: `1px solid ${c}55`, color: pkg.popular ? "#150F00" : c, fontSize: 8, fontWeight: 700, letterSpacing: "2px", padding: "3px 10px", borderRadius: 99 }}>
//                     {pkg.tag}
//                 </div>
//             )}

//             {/* ID badge */}
//             <div style={{ position: "absolute", top: 12, right: 12, fontSize: 8, color: "#D4A84740", letterSpacing: "1px" }}>#{pkg.id}</div>

//             {/* Label */}
//             <div style={{ fontSize: 9, letterSpacing: "3px", color: `${c}90`, marginBottom: 10, marginTop: pkg.tag ? 6 : 0 }}>{pkg.label}</div>

//             {/* Price */}
//             <div style={{ fontFamily: "'Cinzel',serif", fontSize: 26, fontWeight: 900, color: c, lineHeight: 1, marginBottom: 4 }}>₹{fmt(pkg.rupees)}</div>

//             {/* Divider */}
//             <div style={{ height: 1, background: `linear-gradient(90deg,${c}30,transparent)`, margin: "12px 0" }} />

//             {/* Coins */}
//             <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
//                 <svg width="18" height="18" viewBox="0 0 24 24">
//                     <circle cx="12" cy="12" r="10" fill={`${c}22`} stroke={c} strokeWidth="1.5" />
//                     <text x="12" y="16" textAnchor="middle" fontSize="9" fontWeight="700" fill={c} fontFamily="'Cinzel',serif">₵</text>
//                 </svg>
//                 <span style={{ fontFamily: "'Cinzel',serif", fontSize: 20, fontWeight: 700, color: "#fff" }}>{fmt(pkg.coins)}</span>
//                 <span style={{ fontSize: 10, color: `${c}80` }}>COINS</span>
//             </div>

//             {/* Bonus badge */}
//             <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", background: `${c}10`, border: `1px solid ${c}20`, borderRadius: 6, fontSize: 10, color: `${c}90`, marginBottom: 14 }}>
//                 ⚡ +{fmt(pkg.bonus)} BONUS · {pkg.pct} EXTRA
//             </div>

//             {/* Popular badge */}
//             {pkg.popular && (
//                 <div style={{ position: "absolute", top: 12, left: 12, width: 7, height: 7, borderRadius: "50%", background: "#F0C96A", boxShadow: "0 0 8px #F0C96A" }} />
//             )}

//             {/* Action buttons */}
//             <div style={{ display: "flex", gap: 8 }}>
//                 <button onClick={() => onEdit(pkg)}
//                     style={{ flex: 1, padding: "9px", borderRadius: 8, background: "#D4A84710", border: "1px solid #D4A84730", color: "#D4A847", fontSize: 9, fontWeight: 700, letterSpacing: "2px", fontFamily: "'Space Mono',monospace", cursor: "pointer" }}>
//                     ✏ EDIT
//                 </button>
//                 <button onClick={() => onDelete(pkg)}
//                     style={{ flex: 1, padding: "9px", borderRadius: 8, background: "#ef444410", border: "1px solid #ef444430", color: "#ef4444", fontSize: 9, fontWeight: 700, letterSpacing: "2px", fontFamily: "'Space Mono',monospace", cursor: "pointer" }}>
//                     🗑 DELETE
//                 </button>
//             </div>
//         </div>
//     );
// }

// // ── Stats Bar ─────────────────────────────────────────────────────────────────
// function StatsBar({ packages }) {
//     const totalPackages = packages.length;
//     const popularCount = packages.filter((p) => p.popular).length;
//     const maxCoins = packages.reduce((m, p) => Math.max(m, p.coins || 0), 0);
//     const minPrice = packages.reduce((m, p) => Math.min(m, p.rupees || Infinity), Infinity);

//     const stats = [
//         { label: "TOTAL PACKAGES", value: totalPackages, icon: "📦" },
//         { label: "POPULAR", value: popularCount, icon: "⭐" },
//         { label: "MAX COINS", value: fmt(maxCoins), icon: "₵" },
//         { label: "FROM", value: `₹${fmt(minPrice === Infinity ? 0 : minPrice)}`, icon: "💰" },
//     ];

//     return (
//         <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 10, marginBottom: 24 }}>
//             {stats.map((s) => (
//                 <div key={s.label} style={{ padding: "14px 16px", borderRadius: 12, background: "linear-gradient(145deg,#0E0B08,#090705)", border: "1px solid #D4A84720", fontFamily: "'Space Mono',monospace" }}>
//                     <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
//                         <span style={{ fontSize: 14 }}>{s.icon}</span>
//                         <span style={{ fontSize: 9, letterSpacing: "2px", color: "#D4A84760" }}>{s.label}</span>
//                     </div>
//                     <div style={{ fontFamily: "'Cinzel',serif", fontSize: 20, fontWeight: 700, color: "#D4A847" }}>{s.value}</div>
//                 </div>
//             ))}
//         </div>
//     );
// }

// // ══════════════════════════════════════════════════════════════════════════════
// //  MAIN ADMIN PAGE
// // ══════════════════════════════════════════════════════════════════════════════
// export default function AdminPackages() {
//     const [packages, setPackages] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [modal, setModal] = useState(null);  // { mode: 'create'|'edit', data? }
//     const [delPkg, setDelPkg] = useState(null);  // package to delete
//     const { toasts, success, error } = useToast();

//     // ── Fetch all packages ──────────────────────────────────────────────────
//     const fetchPackages = async () => {
//         try {

//             const res = await api.get("/admin/package")

//             console.log(res?.data?.data);

//             if (res?.data.success) setPackages(res?.data?.data || []);
//             else error("Failed to load packages");
//         } catch {
//             error("Cannot connect to server");
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => { fetchPackages(); }, []);

//     // ── Create ──────────────────────────────────────────────────────────────
//     const handleCreate = async (form) => {
//         try {
//             // const res = await fetch(`${api}/admin/package`, {
//             //     method: "POST", headers: authHeaders(), body: JSON.stringify(form),
//             // });
//             // const data = await res.json();

//             const res = await api.post("/admin/package", { form })
//             const data = res

//             console.log(data);


//             if (data.success) {
//                 success("Package created successfully ✦");
//                 setModal(null);
//                 fetchPackages();
//             } else {
//                 error(data.message || "Failed to create package");
//             }
//         } catch {
//             error("Server error");
//         }
//     };

//     // ── Update ──────────────────────────────────────────────────────────────
//     const handleUpdate = async (form) => {
//         try {
//             const res = await api.put(`/admin/package/${modal.data.id}`, { form })

//             const data = res


//             if (data.success) {
//                 success("Package updated successfully ✦");
//                 setModal(null);
//                 fetchPackages();
//             } else {
//                 error(data.message || "Failed to update package");
//             }
//         } catch {
//             error("Server error");
//         }
//     };

//     // ── Delete ──────────────────────────────────────────────────────────────
//     const handleDelete = async () => {
//         try {
//             const res = await api.delete(`/admin/package/${delPkg?.id}`)
//             const data = res
//             if (data.success) {
//                 success("Package deleted ✦");
//                 setDelPkg(null);
//                 fetchPackages();
//             } else {
//                 error(data.message || "Failed to delete");
//             }
//         } catch {
//             error("Server error");
//         }
//     };




//     // ── Render ──────────────────────────────────────────────────────────────
//     return (
//         <div style={{ minHeight: "100vh", background: "#070604", fontFamily: "'Space Mono',monospace", padding: "32px 24px" }}>

//             {/* Ambient */}
//             <div style={{ position: "fixed", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 60% 40% at 50% 20%,#D4A84710,transparent 65%)", zIndex: 0 }} />
//             <div style={{ position: "fixed", inset: 0, pointerEvents: "none", backgroundImage: "linear-gradient(#D4A84706 1px,transparent 1px),linear-gradient(90deg,#D4A84706 1px,transparent 1px)", backgroundSize: "44px 44px", zIndex: 0 }} />

//             <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto" }}>

//                 {/* ── Page Header ── */}
//                 <div style={{ marginBottom: 28 }}>
//                     <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
//                         <svg width="14" height="14" viewBox="0 0 14 14"><polygon points="7,1 13,7 7,13 1,7" fill="#D4A84718" stroke="#D4A847" strokeWidth=".8" /></svg>
//                         <span style={{ fontSize: 9, letterSpacing: "5px", color: "#D4A84760" }}>ADMIN PANEL</span>
//                         <svg width="14" height="14" viewBox="0 0 14 14"><polygon points="7,1 13,7 7,13 1,7" fill="#D4A84718" stroke="#D4A847" strokeWidth=".8" /></svg>
//                     </div>
//                     <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
//                         <h1 style={{ fontFamily: "'Cinzel',serif", fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 900, color: "#D4A847", letterSpacing: 4, margin: 0 }}>
//                             COIN PACKAGES
//                         </h1>
//                         <button
//                             onClick={() => setModal({ mode: "create" })}
//                             style={{
//                                 padding: "11px 28px", borderRadius: 10, cursor: "pointer", fontFamily: "'Space Mono',monospace",
//                                 fontSize: 10, fontWeight: 700, letterSpacing: "3px", border: "none",
//                                 background: "linear-gradient(135deg,#B8860B,#D4A847,#F0C96A,#D4A847,#B8860B)",
//                                 color: "#150F00", boxShadow: "0 0 30px #D4A84740,0 4px 20px #00000060",
//                             }}>
//                             + CREATE PACKAGE
//                         </button>
//                     </div>
//                     {/* Divider */}
//                     <div style={{ height: 1, background: "linear-gradient(90deg,transparent,#D4A84730,transparent)", marginTop: 20 }} />
//                 </div>

//                 {/* ── Stats ── */}
//                 {!loading && packages.length > 0 && <StatsBar packages={packages} />}

//                 {/* ── Loading ── */}
//                 {loading && (
//                     <div style={{ textAlign: "center", padding: "80px 0" }}>
//                         <svg width="52" height="52" viewBox="0 0 52 52" style={{ margin: "0 auto 16px", display: "block", animation: "gpSpin 1.5s linear infinite" }}>
//                             <polygon points="26,2 50,26 26,50 2,26" fill="#D4A84715" stroke="#D4A847" strokeWidth="1.2" />
//                         </svg>
//                         <p style={{ fontSize: 10, letterSpacing: "4px", color: "#D4A84760" }}>LOADING PACKAGES...</p>
//                     </div>
//                 )}

//                 {/* ── Empty state ── */}
//                 {!loading && packages.length === 0 && (
//                     <div style={{ textAlign: "center", padding: "80px 0", border: "1px dashed #D4A84730", borderRadius: 16 }}>
//                         <div style={{ fontSize: 40, marginBottom: 16 }}>📦</div>
//                         <div style={{ fontFamily: "'Cinzel',serif", fontSize: 16, color: "#D4A847", letterSpacing: 3, marginBottom: 8 }}>NO PACKAGES YET</div>
//                         <p style={{ fontSize: 11, color: "#D4A84760", marginBottom: 20 }}>Create your first coin package to get started</p>
//                         <button onClick={() => setModal({ mode: "create" })}
//                             style={{ padding: "11px 28px", borderRadius: 8, background: "#D4A84715", border: "1px solid #D4A84735", color: "#D4A847", fontSize: 10, fontWeight: 700, letterSpacing: "2.5px", fontFamily: "'Space Mono',monospace", cursor: "pointer" }}>
//                             + CREATE FIRST PACKAGE
//                         </button>
//                     </div>
//                 )}

//                 {/* ── Packages Grid ── */}
//                 {!loading && packages.length > 0 && (
//                     <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 16 }}>
//                         {packages?.map((pkg) => (
//                             <PackageCard
//                                 key={pkg.id}
//                                 pkg={pkg}
//                                 onEdit={(p) => setModal({ mode: "edit", data: p })}
//                                 onDelete={setDelPkg}
//                             />
//                         ))}
//                     </div>
//                 )}

//                 {/* Footer */}
//                 <div style={{ textAlign: "center", marginTop: 40, fontSize: 9, color: "#D4A84730", letterSpacing: "3px" }}>
//                     ✦ &nbsp; GAMEPLAY ADMIN &nbsp; · &nbsp; {packages.length} PACKAGES &nbsp; ✦
//                 </div>
//             </div>

//             {/* ── Modals ── */}
//             {modal?.mode === "create" && (
//                 <PackageModal mode="create" onSave={handleCreate} onClose={() => setModal(null)} />
//             )}
//             {modal?.mode === "edit" && (
//                 <PackageModal mode="edit" initial={modal.data} onSave={handleUpdate} onClose={() => setModal(null)} />
//             )}
//             <DeleteModal pkg={delPkg} onConfirm={handleDelete} onClose={() => setDelPkg(null)} />

//             {/* Toasts */}
//             <Toasts toasts={toasts} />

//             <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Space+Mono:wght@400;700&display=swap');
//         @keyframes gpFadeSlide { from{opacity:0;transform:translateX(16px)} to{opacity:1;transform:translateX(0)} }
//         @keyframes gpSlideUp   { from{opacity:0;transform:translateY(18px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
//         @keyframes gpSpin      { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
//         @keyframes pulseGold   { 0%,100%{opacity:1} 50%{opacity:.6} }
//         input::placeholder     { color:#D4A84740; }
//         input[type=number]::-webkit-inner-spin-button { opacity:.3; }
//         ::-webkit-scrollbar            { width:5px; }
//         ::-webkit-scrollbar-track      { background:#0D0B08; }
//         ::-webkit-scrollbar-thumb      { background:#D4A84730; border-radius:99px; }
//         ::-webkit-scrollbar-thumb:hover{ background:#D4A84750; }
//       `}</style>
//         </div>
//     );
// }



import { useState, useEffect } from "react";
import api from "../utils/api.js";

// ── Predefined package templates ──────────────────────────────────────────────
const PACKAGES_TEMPLATES = [
    { id: 1, rupees: 1, coins: 130, bonus: 30, pct: '30%', label: 'STARTER', tag: null, popular: false },
    { id: 2, rupees: 2, coins: 350, bonus: 100, pct: '40%', label: 'CLASSIC', tag: 'POPULAR', popular: true },
    { id: 3, rupees: 5, coins: 750, bonus: 250, pct: '50%', label: 'ELITE', tag: 'BEST VALUE', popular: false },
    { id: 4, rupees: 10, coins: 1600, bonus: 600, pct: '60%', label: 'ROYAL', tag: null, popular: false },
    { id: 5, rupees: 25, coins: 4250, bonus: 1750, pct: '70%', label: 'PLATINUM', tag: '🔥 HOT', popular: false },
    { id: 6, rupees: 50, coins: 9000, bonus: 4000, pct: '80%', label: 'DIAMOND', tag: 'MAX BONUS', popular: false },
];

// Extract unique tags (excluding null)
const UNIQUE_TAGS = [...new Set(PACKAGES_TEMPLATES.map(p => p.tag).filter(t => t !== null))];
const TAG_OPTIONS = ["", ...UNIQUE_TAGS]; // empty for no tag

// ── Helper ─────────────────────────────────────────────────────────────────────
const fmt = (n) => Number(n || 0).toLocaleString("en-IN");

function useToast() {
    const [toasts, setToasts] = useState([]);
    const add = (msg, type = "success") => {
        const id = Date.now();
        setToasts((p) => [...p, { id, msg, type }]);
        setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
    };
    return { toasts, success: (m) => add(m, "success"), error: (m) => add(m, "error") };
}

function Toasts({ toasts }) {
    return (
        <div style={{ position: "fixed", top: 80, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8, fontFamily: "'Space Mono',monospace" }}>
            {toasts.map((t) => (
                <div key={t.id} style={{
                    padding: "11px 18px", borderRadius: 10, fontSize: 11, letterSpacing: ".5px",
                    background: t.type === "success" ? "#22c55e18" : "#ef444418",
                    border: `1px solid ${t.type === "success" ? "#22c55e45" : "#ef444445"}`,
                    color: t.type === "success" ? "#22c55e" : "#ef4444",
                    boxShadow: "0 8px 32px #00000060",
                    animation: "gpFadeSlide .3s ease forwards",
                }}>
                    {t.type === "success" ? "✓" : "✕"}&nbsp;&nbsp;{t.msg}
                </div>
            ))}
        </div>
    );
}

// ── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteModal({ pkg, onConfirm, onClose }) {
    if (!pkg) return null;
    return (
        <div onClick={(e) => e.target === e.currentTarget && onClose()}
            style={{ position: "fixed", inset: 0, zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(4,3,2,.85)", backdropFilter: "blur(8px)", fontFamily: "'Space Mono',monospace" }}>
            <div style={{ position: "relative", width: 340, borderRadius: 16, border: "1px solid #D4A84728", background: "linear-gradient(160deg,#0E0B08,#090705)", boxShadow: "0 0 0 1px #D4A84710 inset,0 40px 100px #000000A0", overflow: "hidden", padding: "32px 28px 28px", animation: "gpSlideUp .25s cubic-bezier(.16,1,.3,1) forwards" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent 5%,#8B6914 25%,#D4A847 50%,#8B6914 75%,transparent 95%)" }} />
                <div style={{ textAlign: "center", marginBottom: 20 }}>
                    <div style={{ fontSize: 28, marginBottom: 12 }}>🗑️</div>
                    <div style={{ fontFamily: "'Cinzel',serif", fontSize: 16, fontWeight: 900, color: "#ef4444", letterSpacing: 3, marginBottom: 8 }}>DELETE PACKAGE</div>
                    <p style={{ fontSize: 11, color: "#D4A84760", lineHeight: 1.8, letterSpacing: ".5px" }}>
                        Are you sure you want to delete<br />
                        <span style={{ color: "#D4A847", fontWeight: 700 }}>"{pkg.label}"</span> package?<br />
                        This action cannot be undone.
                    </p>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={onConfirm} style={{ flex: 1, padding: "11px", borderRadius: 8, background: "#ef444412", border: "1px solid #ef444435", color: "#ef4444", fontSize: 10, fontWeight: 700, letterSpacing: "2.5px", fontFamily: "'Space Mono',monospace", cursor: "pointer" }}>
                        DELETE
                    </button>
                    <button onClick={onClose} style={{ flex: 1, padding: "11px", borderRadius: 8, background: "#D4A84710", border: "1px solid #D4A84730", color: "#D4A847", fontSize: 10, fontWeight: 700, letterSpacing: "2.5px", fontFamily: "'Space Mono',monospace", cursor: "pointer" }}>
                        CANCEL
                    </button>
                </div>
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent 5%,#8B691440 30%,#D4A84725 50%,#8B691440 70%,transparent 95%)" }} />
            </div>
        </div>
    );
}

// ── Package Form Modal (Create / Edit) ───────────────────────────────────────
const EMPTY_FORM = { rupees: "", coins: "", bonus: "", pct: "", label: "", tag: "", popular: false };

function PackageModal({ mode, initial, onSave, onClose }) {
    const [form, setForm] = useState(initial || EMPTY_FORM);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const update = (k) => (e) =>
        setForm((p) => ({ ...p, [k]: k === "popular" ? e.target.checked : e.target.value }));

    // When label is selected from dropdown, auto-fill other fields from template
    const handleLabelChange = (e) => {
        const selectedLabel = e.target.value;
        if (selectedLabel === "") {
            // If empty is selected, reset all fields
            setForm(EMPTY_FORM);
        } else {
            const template = PACKAGES_TEMPLATES.find(p => p.label === selectedLabel);
            if (template) {
                setForm({
                    rupees: template.rupees,
                    coins: template.coins,
                    bonus: template.bonus,
                    pct: template.pct,
                    label: template.label,
                    tag: template.tag || "",
                    popular: template.popular,
                });
            } else {
                setForm({ ...form, label: selectedLabel });
            }
        }
    };

    const validate = () => {
        const e = {};
        if (!form.label?.trim()) e.label = "Label is required";
        if (!form.rupees || form.rupees <= 0) e.rupees = "Enter valid amount";
        if (!form.coins || form.coins <= 0) e.coins = "Enter valid coins";
        if (!form.bonus || form.bonus < 0) e.bonus = "Enter valid bonus";
        if (!form.pct?.trim()) e.pct = "Enter percentage e.g. 30%";
        return e;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setLoading(true);
        await onSave({ ...form, rupees: Number(form.rupees), coins: Number(form.coins), bonus: Number(form.bonus), popular: !!form.popular });
        setLoading(false);
    };

    const inputStyle = (err) => ({
        width: "100%", padding: "10px 14px", background: "#D4A84710",
        border: `1px solid ${err ? "#ef444440" : "#D4A84730"}`,
        borderRadius: 8, color: "#D4A847", fontSize: 13, fontWeight: 700,
        fontFamily: "'Space Mono',monospace", outline: "none", boxSizing: "border-box",
    });

    const labelStyle = { fontSize: 9, letterSpacing: "3px", color: "#D4A84770", fontFamily: "'Space Mono',monospace", display: "block", marginBottom: 6 };

    return (
        <div onClick={(e) => e.target === e.currentTarget && onClose()}
            style={{ position: "fixed", inset: 0, zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(4,3,2,.85)", backdropFilter: "blur(8px)", fontFamily: "'Space Mono',monospace", padding: 16 }}>
            <div style={{ position: "relative", width: "100%", maxWidth: 500, maxHeight: "90vh", overflowY: "scroll", borderRadius: 18, border: "1px solid #D4A84728", background: "linear-gradient(160deg,#0E0B08,#090705)", boxShadow: "0 0 0 1px #D4A84710 inset,0 50px 120px #000000A0", overflow: "hidden", animation: "gpSlideUp .25s cubic-bezier(.16,1,.3,1) forwards", }}>
                <div style={{ position: "sticky", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent 5%,#8B6914 25%,#D4A847 50%,#8B6914 75%,transparent 95%)", zIndex: 1 }} />

                <div style={{ padding: "28px 28px 24px" }}>
                    {/* Header */}
                    <div style={{ textAlign: "center", marginBottom: 24 }}>
                        <div style={{ fontSize: 9, letterSpacing: "5px", color: "#D4A84750", marginBottom: 8 }}>
                            {mode === "create" ? "NEW PACKAGE" : "EDIT PACKAGE"}
                        </div>
                        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 18, fontWeight: 900, color: "#D4A847", letterSpacing: 4 }}>
                            {mode === "create" ? "CREATE PACKAGE" : `EDIT — ${initial?.label}`}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                        {/* Label Dropdown */}
                        <div>
                            <label style={labelStyle}>PACKAGE LABEL *</label>
                            <select
                                value={form.label}
                                onChange={handleLabelChange}
                                style={inputStyle(errors.label)}
                            >
                                <option value="">-- Select a package template --</option>
                                {PACKAGES_TEMPLATES.map(pkg => (
                                    <option key={pkg.label} value={pkg.label}>{pkg.label}</option>
                                ))}
                            </select>
                            {errors.label && <span style={{ fontSize: 10, color: "#ef4444", marginTop: 4, display: "block" }}>{errors.label}</span>}
                        </div>

                        {/* Rupees + Coins */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            <div>
                                <label style={labelStyle}>PRICE (₹) *</label>
                                <input type="number" placeholder="100" value={form.rupees} onChange={update("rupees")} style={inputStyle(errors.rupees)} min="1" />
                                {errors.rupees && <span style={{ fontSize: 10, color: "#ef4444", marginTop: 4, display: "block" }}>{errors.rupees}</span>}
                            </div>
                            <div>
                                <label style={labelStyle}>COINS *</label>
                                <input type="number" placeholder="130" value={form.coins} onChange={update("coins")} style={inputStyle(errors.coins)} min="1" />
                                {errors.coins && <span style={{ fontSize: 10, color: "#ef4444", marginTop: 4, display: "block" }}>{errors.coins}</span>}
                            </div>
                        </div>

                        {/* Bonus + Pct */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            <div>
                                <label style={labelStyle}>BONUS COINS *</label>
                                <input type="number" placeholder="30" value={form.bonus} onChange={update("bonus")} style={inputStyle(errors.bonus)} min="0" />
                                {errors.bonus && <span style={{ fontSize: 10, color: "#ef4444", marginTop: 4, display: "block" }}>{errors.bonus}</span>}
                            </div>
                            <div>
                                <label style={labelStyle}>PERCENTAGE *</label>
                                <input placeholder="30%" value={form.pct} onChange={update("pct")} style={inputStyle(errors.pct)} />
                                {errors.pct && <span style={{ fontSize: 10, color: "#ef4444", marginTop: 4, display: "block" }}>{errors.pct}</span>}
                            </div>
                        </div>

                        {/* Tag Dropdown */}
                        <div>
                            <label style={labelStyle}>TAG (OPTIONAL)</label>
                            <select value={form.tag} onChange={update("tag")} style={inputStyle(false)}>
                                <option value="">No Tag</option>
                                {TAG_OPTIONS.filter(t => t !== "").map(tag => (
                                    <option key={tag} value={tag}>{tag}</option>
                                ))}
                            </select>
                            <span style={{ fontSize: 9, color: "#D4A84750", marginTop: 4, display: "block", letterSpacing: "1px" }}>
                                Choose a tag or leave empty
                            </span>
                        </div>

                        {/* Popular toggle */}
                        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "#D4A84708", borderRadius: 8, border: "1px solid #D4A84720" }}>
                            <button type="button"
                                onClick={() => setForm((p) => ({ ...p, popular: !p.popular }))}
                                style={{
                                    width: 20, height: 20, borderRadius: 5, border: `1px solid ${form.popular ? "#D4A847" : "#D4A84740"}`,
                                    background: form.popular ? "#D4A84725" : "transparent", cursor: "pointer",
                                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                                }}>
                                {form.popular && (
                                    <svg width="11" height="11" viewBox="0 0 10 10">
                                        <path d="M1.5 5L4 7.5L8.5 2.5" stroke="#D4A847" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                            </button>
                            <div>
                                <div style={{ fontSize: 10, color: "#D4A847", letterSpacing: "2px", fontWeight: 700 }}>MARK AS POPULAR</div>
                                <div style={{ fontSize: 9, color: "#D4A84760", letterSpacing: "1px", marginTop: 2 }}>Highlighted with special styling on deposit page</div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "4px 0" }}>
                            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,transparent,#D4A84730)" }} />
                            <svg width="12" height="12" viewBox="0 0 12 12"><polygon points="6,1 11,6 6,11 1,6" fill="#D4A84718" stroke="#D4A847" strokeWidth=".7" /></svg>
                            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,#D4A84730,transparent)" }} />
                        </div>

                        {/* Submit */}
                        <div style={{ display: "flex", gap: 10 }}>
                            <button type="submit" disabled={loading}
                                style={{
                                    flex: 2, padding: "13px", borderRadius: 8, cursor: loading ? "not-allowed" : "pointer",
                                    background: loading ? "#D4A84718" : "linear-gradient(135deg,#B8860B,#D4A847,#F0C96A,#D4A847,#B8860B)",
                                    border: "none", color: loading ? "#D4A84760" : "#150F00",
                                    fontSize: 11, fontWeight: 700, letterSpacing: "3px", fontFamily: "'Space Mono',monospace",
                                }}>
                                {loading ? "SAVING..." : mode === "create" ? "CREATE PACKAGE" : "SAVE CHANGES"}
                            </button>
                            <button type="button" onClick={onClose} disabled={loading}
                                style={{ flex: 1, padding: "13px", borderRadius: 8, background: "transparent", border: "1px solid #D4A84730", color: "#D4A84770", fontSize: 10, fontWeight: 700, letterSpacing: "2px", fontFamily: "'Space Mono',monospace", cursor: "pointer" }}>
                                CANCEL
                            </button>
                        </div>
                    </form>
                </div>

                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent 5%,#8B691440 30%,#D4A84725 50%,#8B691440 70%,transparent 95%)" }} />
            </div>
        </div>
    );
}

// ── Package Card (unchanged) ─────────────────────────────────────────────────────────────
function PackageCard({ pkg, onEdit, onDelete }) {
    const [hovered, setHovered] = useState(false);
    const c = pkg.popular ? "#F0C96A" : "#D4A847";

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                position: "relative", borderRadius: 14, padding: "20px 18px",
                border: `1px solid ${hovered ? c + "55" : "#D4A84728"}`,
                background: hovered ? `linear-gradient(160deg,${c}10,${c}05)` : "linear-gradient(160deg,#0E0B08,#090705)",
                boxShadow: hovered ? `0 16px 48px #00000080,0 0 30px ${c}15` : "0 4px 20px #00000050",
                transform: hovered ? "translateY(-4px)" : "translateY(0)",
                transition: "all .25s cubic-bezier(.16,1,.3,1)",
                fontFamily: "'Space Mono',monospace",
            }}>

            {/* Top shimmer */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${c}30,transparent)`, opacity: hovered ? 1 : 0, transition: "opacity .25s" }} />

            {/* Tag */}
            {pkg.tag && (
                <div style={{ position: "absolute", top: -10, left: 16, background: pkg.popular ? "linear-gradient(135deg,#B8860B,#D4A847,#F0C96A)" : `${c}22`, border: `1px solid ${c}55`, color: pkg.popular ? "#150F00" : c, fontSize: 8, fontWeight: 700, letterSpacing: "2px", padding: "3px 10px", borderRadius: 99 }}>
                    {pkg.tag}
                </div>
            )}

            {/* ID badge */}
            <div style={{ position: "absolute", top: 12, right: 12, fontSize: 8, color: "#D4A84740", letterSpacing: "1px" }}>#{pkg.id}</div>

            {/* Label */}
            <div style={{ fontSize: 9, letterSpacing: "3px", color: `${c}90`, marginBottom: 10, marginTop: pkg.tag ? 6 : 0 }}>{pkg.label}</div>

            {/* Price */}
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 26, fontWeight: 900, color: c, lineHeight: 1, marginBottom: 4 }}>₹{fmt(pkg.rupees)}</div>

            {/* Divider */}
            <div style={{ height: 1, background: `linear-gradient(90deg,${c}30,transparent)`, margin: "12px 0" }} />

            {/* Coins */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <svg width="18" height="18" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill={`${c}22`} stroke={c} strokeWidth="1.5" />
                    <text x="12" y="16" textAnchor="middle" fontSize="9" fontWeight="700" fill={c} fontFamily="'Cinzel',serif">₵</text>
                </svg>
                <span style={{ fontFamily: "'Cinzel',serif", fontSize: 20, fontWeight: 700, color: "#fff" }}>{fmt(pkg.coins)}</span>
                <span style={{ fontSize: 10, color: `${c}80` }}>COINS</span>
            </div>

            {/* Bonus badge */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", background: `${c}10`, border: `1px solid ${c}20`, borderRadius: 6, fontSize: 10, color: `${c}90`, marginBottom: 14 }}>
                ⚡ +{fmt(pkg.bonus)} BONUS · {pkg.pct} EXTRA
            </div>

            {/* Popular badge */}
            {pkg.popular && (
                <div style={{ position: "absolute", top: 12, left: 12, width: 7, height: 7, borderRadius: "50%", background: "#F0C96A", boxShadow: "0 0 8px #F0C96A" }} />
            )}

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => onEdit(pkg)}
                    style={{ flex: 1, padding: "9px", borderRadius: 8, background: "#D4A84710", border: "1px solid #D4A84730", color: "#D4A847", fontSize: 9, fontWeight: 700, letterSpacing: "2px", fontFamily: "'Space Mono',monospace", cursor: "pointer" }}>
                    ✏ EDIT
                </button>
                <button onClick={() => onDelete(pkg)}
                    style={{ flex: 1, padding: "9px", borderRadius: 8, background: "#ef444410", border: "1px solid #ef444430", color: "#ef4444", fontSize: 9, fontWeight: 700, letterSpacing: "2px", fontFamily: "'Space Mono',monospace", cursor: "pointer" }}>
                    🗑 DELETE
                </button>
            </div>
        </div>
    );
}

// ── Stats Bar (unchanged) ─────────────────────────────────────────────────────────────────
function StatsBar({ packages }) {
    const totalPackages = packages.length;
    const popularCount = packages.filter((p) => p.popular).length;
    const maxCoins = packages.reduce((m, p) => Math.max(m, p.coins || 0), 0);
    const minPrice = packages.reduce((m, p) => Math.min(m, p.rupees || Infinity), Infinity);

    const stats = [
        { label: "TOTAL PACKAGES", value: totalPackages, icon: "📦" },
        { label: "POPULAR", value: popularCount, icon: "⭐" },
        { label: "MAX COINS", value: fmt(maxCoins), icon: "₵" },
        { label: "FROM", value: `₹${fmt(minPrice === Infinity ? 0 : minPrice)}`, icon: "💰" },
    ];

    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 10, marginBottom: 24 }}>
            {stats.map((s) => (
                <div key={s.label} style={{ padding: "14px 16px", borderRadius: 12, background: "linear-gradient(145deg,#0E0B08,#090705)", border: "1px solid #D4A84720", fontFamily: "'Space Mono',monospace" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 14 }}>{s.icon}</span>
                        <span style={{ fontSize: 9, letterSpacing: "2px", color: "#D4A84760" }}>{s.label}</span>
                    </div>
                    <div style={{ fontFamily: "'Cinzel',serif", fontSize: 20, fontWeight: 700, color: "#D4A847" }}>{s.value}</div>
                </div>
            ))}
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN ADMIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function AdminPackages() {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null);  // { mode: 'create'|'edit', data? }
    const [delPkg, setDelPkg] = useState(null);  // package to delete
    const { toasts, success, error } = useToast();

    // ── Fetch all packages ──────────────────────────────────────────────────
    const fetchPackages = async () => {
        try {
            const res = await api.get("/admin/package")
            console.log(res?.data?.data);
            if (res?.data.success) setPackages(res?.data?.data || []);
            else error("Failed to load packages");
        } catch {
            error("Cannot connect to server");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPackages(); }, []);

    // ── Create ──────────────────────────────────────────────────────────────
    const handleCreate = async (form) => {
        try {
            const res = await api.post("/admin/package", { form })
            const data = res
            console.log(data, "ASDFGHJKL");
            if (data?.data?.success) {
                success("Package created successfully ✦");
                setModal(null);
                fetchPackages();
            } else {
                error(data.message || "Failed to create package");
            }
        } catch {
            error("Server error");
        }
    };

    // ── Update ──────────────────────────────────────────────────────────────
    const handleUpdate = async (form) => {
        try {
            const res = await api.put(`/admin/package/${modal.data.id}`, { form })
            const data = res
            if (data?.data?.success) {
                success("Package updated successfully ✦");
                setModal(null);
                fetchPackages();
            } else {
                error(data.message || "Failed to update package");
            }
        } catch {
            error("Server error");
        }
    };

    // ── Delete ──────────────────────────────────────────────────────────────
    const handleDelete = async () => {
        try {
            const res = await api.delete(`/admin/package/${delPkg?.id}`)
            const data = res
            if (data?.data?.success) {
                success("Package deleted ✦");
                setDelPkg(null);
                fetchPackages();
            } else {
                error(data.message || "Failed to delete");
            }
        } catch {
            error("Server error");
        }
    };

    // ── Render ──────────────────────────────────────────────────────────────
    return (
        <div style={{ minHeight: "100vh", background: "#070604", fontFamily: "'Space Mono',monospace", padding: "32px 24px" }}>

            {/* Ambient */}
            <div style={{ position: "fixed", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 60% 40% at 50% 20%,#D4A84710,transparent 65%)", zIndex: 0 }} />
            <div style={{ position: "fixed", inset: 0, pointerEvents: "none", backgroundImage: "linear-gradient(#D4A84706 1px,transparent 1px),linear-gradient(90deg,#D4A84706 1px,transparent 1px)", backgroundSize: "44px 44px", zIndex: 0 }} />

            <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto" }}>

                {/* ── Page Header ── */}
                <div style={{ marginBottom: 28 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                        <svg width="14" height="14" viewBox="0 0 14 14"><polygon points="7,1 13,7 7,13 1,7" fill="#D4A84718" stroke="#D4A847" strokeWidth=".8" /></svg>
                        <span style={{ fontSize: 9, letterSpacing: "5px", color: "#D4A84760" }}>ADMIN PANEL</span>
                        <svg width="14" height="14" viewBox="0 0 14 14"><polygon points="7,1 13,7 7,13 1,7" fill="#D4A84718" stroke="#D4A847" strokeWidth=".8" /></svg>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                        <h1 style={{ fontFamily: "'Cinzel',serif", fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 900, color: "#D4A847", letterSpacing: 4, margin: 0 }}>
                            COIN PACKAGES
                        </h1>
                        <button
                            onClick={() => setModal({ mode: "create" })}
                            style={{
                                padding: "11px 28px", borderRadius: 10, cursor: "pointer", fontFamily: "'Space Mono',monospace",
                                fontSize: 10, fontWeight: 700, letterSpacing: "3px", border: "none",
                                background: "linear-gradient(135deg,#B8860B,#D4A847,#F0C96A,#D4A847,#B8860B)",
                                color: "#150F00", boxShadow: "0 0 30px #D4A84740,0 4px 20px #00000060",
                            }}>
                            + CREATE PACKAGE
                        </button>
                    </div>
                    {/* Divider */}
                    <div style={{ height: 1, background: "linear-gradient(90deg,transparent,#D4A84730,transparent)", marginTop: 20 }} />
                </div>

                {/* ── Stats ── */}
                {!loading && packages.length > 0 && <StatsBar packages={packages} />}

                {/* ── Loading ── */}
                {loading && (
                    <div style={{ textAlign: "center", padding: "80px 0" }}>
                        <svg width="52" height="52" viewBox="0 0 52 52" style={{ margin: "0 auto 16px", display: "block", animation: "gpSpin 1.5s linear infinite" }}>
                            <polygon points="26,2 50,26 26,50 2,26" fill="#D4A84715" stroke="#D4A847" strokeWidth="1.2" />
                        </svg>
                        <p style={{ fontSize: 10, letterSpacing: "4px", color: "#D4A84760" }}>LOADING PACKAGES...</p>
                    </div>
                )}

                {/* ── Empty state ── */}
                {!loading && packages.length === 0 && (
                    <div style={{ textAlign: "center", padding: "80px 0", border: "1px dashed #D4A84730", borderRadius: 16 }}>
                        <div style={{ fontSize: 40, marginBottom: 16 }}>📦</div>
                        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 16, color: "#D4A847", letterSpacing: 3, marginBottom: 8 }}>NO PACKAGES YET</div>
                        <p style={{ fontSize: 11, color: "#D4A84760", marginBottom: 20 }}>Create your first coin package to get started</p>
                        <button onClick={() => setModal({ mode: "create" })}
                            style={{ padding: "11px 28px", borderRadius: 8, background: "#D4A84715", border: "1px solid #D4A84735", color: "#D4A847", fontSize: 10, fontWeight: 700, letterSpacing: "2.5px", fontFamily: "'Space Mono',monospace", cursor: "pointer" }}>
                            + CREATE FIRST PACKAGE
                        </button>
                    </div>
                )}

                {/* ── Packages Grid ── */}
                {!loading && packages.length > 0 && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 16 }}>
                        {packages?.map((pkg) => (
                            <PackageCard
                                key={pkg.id}
                                pkg={pkg}
                                onEdit={(p) => setModal({ mode: "edit", data: p })}
                                onDelete={setDelPkg}
                            />
                        ))}
                    </div>
                )}

                {/* Footer */}
                <div style={{ textAlign: "center", marginTop: 40, fontSize: 9, color: "#D4A84730", letterSpacing: "3px" }}>
                    ✦ &nbsp; GAMEPLAY ADMIN &nbsp; · &nbsp; {packages.length} PACKAGES &nbsp; ✦
                </div>
            </div>

            {/* ── Modals ── */}
            {modal?.mode === "create" && (
                <PackageModal mode="create" onSave={handleCreate} onClose={() => setModal(null)} />
            )}
            {modal?.mode === "edit" && (
                <PackageModal mode="edit" initial={modal.data} onSave={handleUpdate} onClose={() => setModal(null)} />
            )}
            <DeleteModal pkg={delPkg} onConfirm={handleDelete} onClose={() => setDelPkg(null)} />

            {/* Toasts */}
            <Toasts toasts={toasts} />

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Space+Mono:wght@400;700&display=swap');
        @keyframes gpFadeSlide { from{opacity:0;transform:translateX(16px)} to{opacity:1;transform:translateX(0)} }
        @keyframes gpSlideUp   { from{opacity:0;transform:translateY(18px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes gpSpin      { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes pulseGold   { 0%,100%{opacity:1} 50%{opacity:.6} }
        input::placeholder     { color:#D4A84740; }
        input[type=number]::-webkit-inner-spin-button { opacity:.3; }
        ::-webkit-scrollbar            { width:5px; }
        ::-webkit-scrollbar-track      { background:#0D0B08; }
        ::-webkit-scrollbar-thumb      { background:#D4A84730; border-radius:99px; }
        ::-webkit-scrollbar-thumb:hover{ background:#D4A84750; }
      `}</style>
        </div>
    );
}