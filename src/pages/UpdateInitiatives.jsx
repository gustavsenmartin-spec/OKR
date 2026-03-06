import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';

export const UpdateInitiatives = () => {
    const { employees, objectives, keyResults, initiatives, currentEmployee, setCurrentEmployee, refreshInitiatives } = useData();

    if (!employees || employees.length === 0) {
        return (
            <div className="page">
                <h2>Oppdater mine initiatives</h2>
                <div className="card" style={{ marginTop: '2rem' }}>
                    Ingen ansatte funnet. Vennligst opprett en ansatt først.
                </div>
            </div>
        );
    }

    const myInitiatives = initiatives.filter(i => i.employee_id === currentEmployee);

    return (
        <div className="page">
            <h2>Oppdater mine initiatives</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Endre status eller legg til en kommentar på dine fullførte eller pågående initiativer.</p>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem' }}>Velg ansatt</label>
                <select
                    className="form-control"
                    style={{ width: '100%', maxWidth: '400px' }}
                    value={currentEmployee || ''}
                    onChange={(e) => setCurrentEmployee(e.target.value)}
                >
                    <option value="">-- Velg deg selv --</option>
                    {employees.map(e => <option key={e.employee_id} value={e.employee_id}>{e.name} ({e.department})</option>)}
                </select>
            </div>

            {currentEmployee && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {myInitiatives.length === 0 ? (
                        <div className="card">Du har ingen registrerte initiativer ennå. Gå til &quot;Registrer initiatives&quot; for å planlegge arbeidet.</div>
                    ) : (
                        objectives.map(obj => {
                            const initsForObj = myInitiatives.filter(i => i.objective_id === obj.objective_id);
                            if (initsForObj.length === 0) return null;

                            return (
                                <div key={obj.objective_id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                                    <h3 style={{ margin: 0, padding: '1.5rem', backgroundColor: 'var(--background)', borderBottom: '1px solid var(--border)' }}>
                                        {obj.objective_code}: {obj.objective_title}
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        {keyResults
                                            .filter(kr => kr.objective_id === obj.objective_id)
                                            .map(kr => {
                                                const initsForKr = initsForObj.filter(i => i.key_result_id === kr.key_result_id);
                                                if (initsForKr.length === 0) return null;

                                                return (
                                                    <div key={kr.key_result_id} style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                                                        <div style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: '1rem', fontSize: '0.875rem' }}>
                                                            Under KR: {kr.full_code}
                                                        </div>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                            {initsForKr.map(init => (
                                                                <InitiativeItem key={init.initiative_id} initiative={init} onUpdate={refreshInitiatives} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        }
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
};

const InitiativeItem = ({ initiative, onUpdate }) => {
    const [status, setStatus] = useState(initiative.status);
    const [comment, setComment] = useState(initiative.comment || '');
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            await api.updateInitiative(initiative.initiative_id, { status, comment });
            await onUpdate();
            setIsEditing(false);
        } catch (err) {
            alert("Kunne ikke lagre: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const formattedDate = new Date(initiative.updated_at).toLocaleDateString('no-NO', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    return (
        <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem', backgroundColor: 'var(--surface)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div style={{ flex: 1, paddingRight: '1rem' }}>
                    <h4 style={{ margin: 0, fontSize: '1rem' }}>{initiative.initiative_title}</h4>
                    {initiative.initiative_description && (
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                            {initiative.initiative_description}
                        </div>
                    )}
                </div>
                <div style={{ flexShrink: 0 }}>
                    <StatusBadge status={initiative.status} />
                </div>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: isEditing ? '1rem' : 0 }}>
                Sist endret: {formattedDate}
            </div>

            {!isEditing && initiative.comment && (
                <div style={{ marginTop: '0.75rem', padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', borderLeft: '3px solid var(--border)' }}>
                    <strong>Kommentar: </strong> {initiative.comment}
                </div>
            )}

            {isEditing ? (
                <div style={{ marginTop: '1rem', borderTop: '1px dashed var(--border)', paddingTop: '1rem' }}>
                    <div className="form-group">
                        <label>Endre status</label>
                        <select className="form-control" value={status} onChange={e => setStatus(e.target.value)}>
                            <option value="Bak skjema">Bak skjema</option>
                            <option value="På skjema">På skjema</option>
                            <option value="Foran skjema">Foran skjema</option>
                            <option value="Ferdig">Ferdig</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Kommentar til oppdateringen</label>
                        <textarea className="form-control" rows={2} value={comment} onChange={e => setComment(e.target.value)} placeholder="Skriv en kort kommentar om hva som er gjort eller avklart..." />
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                        <button className="btn-primary" onClick={handleSave} disabled={loading}>{loading ? 'Lagrer...' : 'Lagre endringer'}</button>
                        <button className="btn-primary" style={{ backgroundColor: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)' }} onClick={() => setIsEditing(false)} disabled={loading}>Avbryt</button>
                    </div>
                </div>
            ) : (
                <div style={{ marginTop: '1rem' }}>
                    <button className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem', backgroundColor: 'var(--background)', color: 'var(--text-main)', border: '1px solid var(--border)' }} onClick={() => setIsEditing(true)}>
                        Oppdater status eller kommentar
                    </button>
                </div>
            )}
        </div>
    );
};
