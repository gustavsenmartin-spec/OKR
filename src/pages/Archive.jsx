import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { Lock, Archive as ArchiveIcon } from 'lucide-react';

export const Archive = () => {
    const { initiatives, employees, objectives, keyResults, refreshInitiatives } = useData();
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [archivedInits, setArchivedInits] = useState([]);

    useEffect(() => {
        const fetchArchived = async () => {
            try {
                const data = await api.getInitiatives({ is_archived: true });
                setArchivedInits(data);
            } catch (err) {
                console.error("Kunne ikke hente arkiverte initiatives:", err);
            }
        };
        fetchArchived();
    }, []);

    const stats = {
        toArchive: initiatives.filter(i => ['Fullført', 'Ikke fullført, men arkiveres'].includes(i.status)).length,
        toCarryForward: initiatives.filter(i => i.status === 'Ikke fullført, videreføres til neste periode').length,
        toKeep: initiatives.filter(i => ['Bak skjema', 'På skjema', 'Foran skjema'].includes(i.status)).length,
    };

    const handleArchive = async () => {
        if (password !== 'MartinArkiv') {
            setMessage('Feil passord. Du har ikke tilgang til å arkivere.');
            return;
        }

        const confirmMsg = `Du er i ferd med å arkivere ${stats.toArchive} initiatives.\n${stats.toCarryForward} initiatives vil videreføres.\n${stats.toKeep} forblir uendret.\n\nVil du fortsette?`;
        if (!window.confirm(confirmMsg)) return;

        setLoading(true);
        setMessage('');

        const batchId = `BATCH-${new Date().getTime()}`;
        const periodLabel = "Vår 2026";
        let archivedCount = 0;
        let carriedCount = 0;

        try {
            for (const init of initiatives) {
                if (['Fullført', 'Ikke fullført, men arkiveres'].includes(init.status)) {
                    await api.updateInitiative(init.initiative_id, {
                        is_archived: true,
                        archived_at: new Date().toISOString(),
                        archived_by: 'MartinArkiv',
                        archive_batch_id: batchId,
                        period_label: periodLabel
                    });
                    archivedCount++;
                } else if (init.status === 'Ikke fullført, videreføres til neste periode') {
                    await api.updateInitiative(init.initiative_id, {
                        carried_forward: true
                    });
                    carriedCount++;
                }
            }

            setMessage(`Suksess! ${archivedCount} initiatives ble arkivert. ${carriedCount} initiatives ble videreført. ${stats.toKeep} initiatives ble beholdt som aktive.`);
            setPassword('');
            await refreshInitiatives();

            // Refresh local archived list
            const data = await api.getInitiatives({ is_archived: true });
            setArchivedInits(data);

        } catch (err) {
            setMessage('En feil oppstod under arkivering: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page" style={{ maxWidth: '1400px' }}>
            <h2>Arkiver initiatives</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Rydd opp og overfør fullførte initiatives til historikken.</p>

            <div className="card" style={{ marginBottom: '2rem', border: '1px solid var(--border)' }}>
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ArchiveIcon size={20} /> Kjør arkivering
                </h3>
                <p style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                    Arkiveringsjobben flytter avsluttede initiativer til historikken. Aktive initiativer beholdes. <br />
                    <strong>Merk:</strong> Denne handlingen krever administratorpassord.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ padding: '1rem', backgroundColor: '#F1F5F9', borderRadius: 'var(--radius-md)', borderLeft: '4px solid #3B82F6' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.toArchive}</div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Klar for arkivering</div>
                    </div>
                    <div style={{ padding: '1rem', backgroundColor: '#EDE9FE', borderRadius: 'var(--radius-md)', borderLeft: '4px solid #7C3AED' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.toCarryForward}</div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Videreføres</div>
                    </div>
                    <div style={{ padding: '1rem', backgroundColor: '#ECFDF5', borderRadius: 'var(--radius-md)', borderLeft: '4px solid #10B981' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.toKeep}</div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Beholdes aktive</div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', maxWidth: '500px' }}>
                    <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
                        <label>Administratorpassord</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)' }} />
                            <input
                                type="password"
                                className="form-control"
                                style={{ paddingLeft: '2.5rem' }}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Passord for arkivering"
                            />
                        </div>
                    </div>
                    <button
                        className="btn-primary"
                        onClick={handleArchive}
                        disabled={loading || !password}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        {loading ? 'Arkiverer...' : 'Arkiver nå'}
                    </button>
                </div>

                {message && (
                    <div style={{
                        marginTop: '1.5rem',
                        padding: '1rem',
                        backgroundColor: message.includes('Suksess') ? '#ECFDF5' : '#FEF2F2',
                        color: message.includes('Suksess') ? '#047857' : '#B91C1C',
                        borderRadius: 'var(--radius-md)',
                        border: `1px solid ${message.includes('Suksess') ? '#A7F3D0' : '#FECACA'}`
                    }}>
                        {message}
                    </div>
                )}
            </div>

            <div className="card">
                <h3 style={{ marginBottom: '1.5rem' }}>Arkivoversikt</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ minWidth: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-muted)' }}>
                                <th style={{ padding: '0.75rem' }}>Dato Arkivert</th>
                                <th style={{ padding: '0.75rem' }}>Ansatt</th>
                                <th style={{ padding: '0.75rem' }}>O/KR</th>
                                <th style={{ padding: '0.75rem' }}>Initiative</th>
                                <th style={{ padding: '0.75rem' }}>Status</th>
                                <th style={{ padding: '0.75rem' }}>Batch</th>
                            </tr>
                        </thead>
                        <tbody>
                            {archivedInits.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Arkivet er foreløpig tomt.</td>
                                </tr>
                            ) : (
                                archivedInits.map(init => {
                                    const emp = employees.find(e => e.employee_id === init.employee_id);
                                    const kr = keyResults.find(k => k.key_result_id === init.key_result_id);
                                    const dt = init.archived_at ? new Date(init.archived_at).toLocaleDateString('no-NO') : '';

                                    return (
                                        <tr key={init.initiative_id} style={{ borderBottom: '1px solid var(--border)', opacity: 0.8 }}>
                                            <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>{dt}</td>
                                            <td style={{ padding: '0.75rem' }}>{emp?.name}</td>
                                            <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>{kr?.full_code}</td>
                                            <td style={{ padding: '0.75rem' }}>
                                                <div style={{ fontWeight: 500 }}>{init.initiative_title}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Periode: {init.period_label}</div>
                                            </td>
                                            <td style={{ padding: '0.75rem' }}><StatusBadge status={init.status} /></td>
                                            <td style={{ padding: '0.75rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>{init.archive_batch_id}</td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
