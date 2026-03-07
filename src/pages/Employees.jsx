import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { api } from '../services/api';

export const Employees = () => {
    const { employees, refreshEmployees } = useData();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [department, setDepartment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name) return;
        setLoading(true);
        await api.createEmployee({ name, email, department });
        await refreshEmployees();
        setName('');
        setEmail('');
        setDepartment('');
        setLoading(false);
    };

    return (
        <div className="page">
            <h2>Ansatte</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Lag nye ansatte som kan registrere OKR-initiativer.</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                <div className="card">
                    <h3>Ny ansatt</h3>
                    <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
                        <div className="form-group">
                            <label>Navn</label>
                            <input className="form-control" value={name} onChange={e => setName(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>E-post</label>
                            <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Avdeling</label>
                            <select className="form-control" value={department} onChange={e => setDepartment(e.target.value)} required>
                                <option value="">Velg avdeling...</option>
                                <option value="Nasjonalt">Nasjonalt</option>
                                <option value="Kystregionen">Kystregionen</option>
                                <option value="Region Øst +">Region Øst +</option>
                            </select>
                        </div>
                        <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '1rem', width: '100%' }}>
                            {loading ? 'Lagrer...' : 'Opprett ansatt'}
                        </button>
                    </form>
                </div>

                <div className="card">
                    <h3>Registrerte ansatte ({employees.length})</h3>
                    <div style={{ marginTop: '1rem', overflowX: 'auto' }}>
                        {employees.length === 0 ? (
                            <p>Ingen ansatte registrert enda.</p>
                        ) : (
                            <table style={{ minWidth: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--border)' }}>
                                        <th style={{ padding: '0.75rem 0' }}>Navn</th>
                                        <th style={{ padding: '0.75rem 0' }}>E-post</th>
                                        <th style={{ padding: '0.75rem 0' }}>Avdeling</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees.map(e => (
                                        <tr key={e.employee_id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '0.75rem 0', fontWeight: 500 }}>{e.name}</td>
                                            <td style={{ padding: '0.75rem 0', color: 'var(--text-muted)' }}>{e.email || '-'}</td>
                                            <td style={{ padding: '0.75rem 0', color: 'var(--text-muted)' }}>{e.department || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
