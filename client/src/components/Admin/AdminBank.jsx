import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const OrnateCorner = ({ style }) => (
    <svg width="22" height="22" viewBox="0 0 28 28" fill="none" style={style}>
        <path d="M2 2 L2 14 M2 2 L14 2" stroke="#D4A84750" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="2" cy="2" r="2" fill="#D4A84770" />
    </svg>
);

export default function AdminBank() {
    const [banks, setBanks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null); // { id, upi_id, qr_image? }
    const [formData, setFormData] = useState({ upi_id: '', qr_file: null });
    const [previewUrl, setPreviewUrl] = useState(null);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxImage, setLightboxImage] = useState('');

    const fetchBanks = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/bank');
            setBanks(res.data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanks();
    }, []);

    const openAddModal = () => {
        setEditing(null);
        setFormData({ upi_id: '', qr_file: null });
        setPreviewUrl(null);
        setModalOpen(true);
    };

    const openEditModal = (bank) => {
        setEditing(bank);
        setFormData({ upi_id: bank.upi_id, qr_file: null });
        setPreviewUrl(null);
        setModalOpen(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, qr_file: file });
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('upi_id', formData.upi_id);
        if (formData.qr_file) data.append('qr_image', formData.qr_file);

        try {
            if (editing) {
                await api.put(`/admin/bank/${editing.id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/admin/bank', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            setModalOpen(false);
            fetchBanks();
        } catch (err) {
            console.error(err);
            alert('Error saving bank detail');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this bank detail?')) return;
        try {
            await api.delete(`/admin/bank/${id}`);
            fetchBanks();
        } catch (err) {
            console.error(err);
            alert('Error deleting');
        }
    };

    const openLightbox = (imageUrl) => {
        setLightboxImage(imageUrl);
        setLightboxOpen(true);
    };

    return (
        <div>
            {/* Title and Add Button */}
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontFamily: 'Cinzel Decorative,serif', fontSize: 18, color: '#F0C96A', letterSpacing: 4 }}>BANK DETAILS</h1>
                    <div style={{ height: 1, background: 'linear-gradient(90deg,#D4A84750,transparent)', marginTop: 10 }} />
                </div>
                <button
                    onClick={openAddModal}
                    style={{
                        padding: '8px 20px',
                        background: '#D4A84720',
                        border: '1px solid #D4A84760',
                        borderRadius: 8,
                        color: '#F0C96A',
                        fontFamily: 'Cinzel,serif',
                        fontSize: 11,
                        letterSpacing: 2,
                        cursor: 'pointer',
                    }}
                >
                    + ADD NEW
                </button>
            </div>

            {/* Table */}
            <div style={{
                background: 'linear-gradient(145deg,#0D0A06,#0A0805)',
                border: '1px solid #D4A84730', borderRadius: 14,
                overflow: 'hidden', position: 'relative',
            }}>
                <OrnateCorner style={{ position: 'absolute', top: 6, left: 6 }} />
                <OrnateCorner style={{ position: 'absolute', top: 6, right: 6, transform: 'scaleX(-1)' }} />

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #D4A84730' }}>
                                <th style={{ padding: '14px 18px', textAlign: 'left', fontFamily: 'Cinzel,serif', fontSize: 10, letterSpacing: 2, color: '#D4A84780' }}>ID</th>
                                <th style={{ padding: '14px 18px', textAlign: 'left', fontFamily: 'Cinzel,serif', fontSize: 10, letterSpacing: 2, color: '#D4A84780' }}>UPI ID</th>
                                <th style={{ padding: '14px 18px', textAlign: 'left', fontFamily: 'Cinzel,serif', fontSize: 10, letterSpacing: 2, color: '#D4A84780' }}>QR CODE</th>
                                <th style={{ padding: '14px 18px', textAlign: 'left', fontFamily: 'Cinzel,serif', fontSize: 10, letterSpacing: 2, color: '#D4A84780' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={4} style={{ padding: 40, textAlign: 'center', color: '#D4A84750' }}>LOADING...</td></tr>
                            ) : banks.length === 0 ? (
                                <tr><td colSpan={4} style={{ padding: 40, textAlign: 'center', color: '#D4A84750' }}>NO RECORDS FOUND</td></tr>
                            ) : (
                                banks.map((bank, i) => (
                                    <tr key={bank.id} style={{ borderBottom: '1px solid #D4A84715', background: i % 2 === 0 ? 'transparent' : '#D4A8470A' }}>
                                        <td style={{ padding: '13px 18px', fontFamily: 'Cinzel,serif', fontSize: 12, color: '#E8C85A' }}>{bank.id}</td>
                                        <td style={{ padding: '13px 18px', fontSize: 13, color: '#D4A84790' }}>{bank.upi_id}</td>
                                        <td style={{ padding: '13px 18px' }}>
                                            {bank.qr_url ? (
                                                <img
                                                    src={bank.qr_url}
                                                    alt="QR"
                                                    style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 8, border: '1px solid #D4A84760', cursor: 'pointer' }}
                                                    onClick={() => openLightbox(bank.qr_url)}
                                                />
                                            ) : (
                                                <span style={{ color: '#D4A84760' }}>No QR</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '13px 18px' }}>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button onClick={() => openEditModal(bank)} style={{
                                                    padding: '5px 12px', borderRadius: 6, border: '1px solid #F0C96A50',
                                                    background: '#F0C96A15', color: '#F0C96A', cursor: 'pointer',
                                                    fontSize: 10, fontFamily: 'Cinzel,serif', letterSpacing: 1
                                                }}>EDIT</button>
                                                <button onClick={() => handleDelete(bank.id)} style={{
                                                    padding: '5px 12px', borderRadius: 6, border: '1px solid #ef444450',
                                                    background: '#ef444415', color: '#ef4444', cursor: 'pointer',
                                                    fontSize: 10, fontFamily: 'Cinzel,serif', letterSpacing: 1
                                                }}>DELETE</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal for Add/Edit */}
            {modalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: '#000000aa', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }} onClick={() => setModalOpen(false)}>
                    <div style={{
                        background: '#0D0A06', border: '1px solid #D4A84760', borderRadius: 20,
                        padding: 24, width: '90%', maxWidth: 500, boxShadow: '0 20px 40px #00000080'
                    }} onClick={e => e.stopPropagation()}>
                        <h2 style={{ fontFamily: 'Cinzel Decorative,serif', fontSize: 18, color: '#F0C96A', marginBottom: 20 }}>
                            {editing ? 'EDIT BANK DETAIL' : 'ADD BANK DETAIL'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', color: '#D4A84790', fontSize: 11, letterSpacing: 1, marginBottom: 6 }}>UPI ID</label>
                                <input
                                    type="text"
                                    value={formData.upi_id}
                                    onChange={e => setFormData({ ...formData, upi_id: e.target.value })}
                                    required
                                    style={{
                                        width: '100%', padding: '10px 12px', background: '#040302', border: '1px solid #D4A84740',
                                        borderRadius: 8, color: '#E8C85A', fontSize: 14, fontFamily: 'monospace'
                                    }}
                                />
                            </div>
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: 'block', color: '#D4A84790', fontSize: 11, letterSpacing: 1, marginBottom: 6 }}>QR IMAGE</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    style={{ width: '100%', color: '#D4A84790', background: '#040302', border: '1px solid #D4A84740', borderRadius: 8, padding: 6 }}
                                />
                                {/* Preview for newly selected file */}
                                {previewUrl && (
                                    <div style={{ marginTop: 10 }}>
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            style={{ maxWidth: '100%', maxHeight: 150, borderRadius: 8, border: '1px solid #D4A84760', cursor: 'pointer' }}
                                            onClick={() => openLightbox(previewUrl)}
                                        />
                                        <div style={{ fontSize: 10, color: '#D4A84770', marginTop: 4 }}>Click image to enlarge</div>
                                    </div>
                                )}
                                {/* Preview for existing image when editing and no new file selected */}
                                {!previewUrl && editing && editing.qr_url && (
                                    <div style={{ marginTop: 10 }}>
                                        <img
                                            src={editing.qr_url}
                                            alt="Current QR"
                                            style={{ maxWidth: '100%', maxHeight: 150, borderRadius: 8, border: '1px solid #D4A84760', cursor: 'pointer' }}
                                            onClick={() => openLightbox(editing.qr_url)}
                                        />
                                        <div style={{ fontSize: 10, color: '#D4A84770', marginTop: 4 }}>
                                            Current QR (upload new to replace) – click to enlarge
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setModalOpen(false)} style={{
                                    padding: '8px 20px', background: 'transparent', border: '1px solid #D4A84740',
                                    borderRadius: 8, color: '#D4A84780', cursor: 'pointer'
                                }}>CANCEL</button>
                                <button type="submit" style={{
                                    padding: '8px 20px', background: '#D4A84720', border: '1px solid #D4A84760',
                                    borderRadius: 8, color: '#F0C96A', cursor: 'pointer'
                                }}>{editing ? 'UPDATE' : 'SAVE'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Lightbox Modal for enlarged image */}
            {lightboxOpen && (
                <div
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: '#000000cc', backdropFilter: 'blur(8px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000,
                        cursor: 'pointer'
                    }}
                    onClick={() => setLightboxOpen(false)}
                >
                    <div style={{ maxWidth: '90vw', maxHeight: '90vh', position: 'relative' }}>
                        <img
                            src={lightboxImage}
                            alt="Enlarged QR"
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 12 }}
                            onClick={(e) => e.stopPropagation()}
                        />
                        <button
                            onClick={() => setLightboxOpen(false)}
                            style={{
                                position: 'absolute', top: -40, right: 0,
                                background: 'none', border: 'none', color: '#F0C96A', fontSize: 24,
                                cursor: 'pointer'
                            }}
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}