import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { api } from '../services/api';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';

export const RegisterInitiative = () => {
    const { employees, objectives, keyResults, initiatives, currentEmployee, setCurrentEmployee, refreshInitiatives } = useData();

    if (!employees || employees.length === 0) {
        return (
            <div className="page">
                <h2>Registrer initiatives</h2>
                <div className="card" style={{ marginTop: '2rem' }}>
                    Ingen ansatte funnet. Vennligst opprett en ansatt først.
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <h2>Registrer initiatives</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Planlegg arbeidet frem mot 15. mai 2026.</p>

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

            {currentEmployee ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {objectives.map(obj => (
                        <ObjectiveAccordion
                            key={obj.objective_id}
                            objective={obj}
                            keyResults={keyResults.filter(kr => kr.objective_id === obj.objective_id)}
                            initiatives={initiatives}
                            currentEmployee={currentEmployee}
                            refreshInitiatives={refreshInitiatives}
                        />
                    ))}
                </div>
            ) : (
                <div style={{ color: 'var(--text-muted)' }}>Vennligst velg en ansatt over for å starte registreringen.</div>
            )}
        </div>
    );
};

const ObjectiveAccordion = ({ objective, keyResults, initiatives, currentEmployee, refreshInitiatives }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <button
                style={{ width: '100%', padding: '1.5rem', background: 'none', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.125rem' }}>{objective.objective_code}: {objective.objective_title}</h3>
                </div>
                <div>
                    {isOpen ? <ChevronUp /> : <ChevronDown />}
                </div>
            </button>

            {isOpen && (
                <div style={{ padding: '0 1.5rem 1.5rem', borderTop: '1px solid var(--border)' }}>
                    {keyResults.map(kr => (
                        <KeyResultSection
                            key={kr.key_result_id}
                            keyResult={kr}
                            objective={objective}
                            initiatives={initiatives.filter(i => i.key_result_id === kr.key_result_id && i.employee_id === currentEmployee)}
                            currentEmployee={currentEmployee}
                            refreshInitiatives={refreshInitiatives}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const KeyResultSection = ({ keyResult, objective, initiatives, currentEmployee, refreshInitiatives }) => {
    const [isAdding, setIsAdding] = useState(false);

    return (
        <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'var(--background)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                    <div style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: '0.25rem' }}>{keyResult.full_code}</div>
                    <div style={{ fontSize: '0.875rem' }}>{keyResult.key_result_title}</div>
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    {initiatives.length} registrert
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                {initiatives.map((init, index) => (
                    <div key={init.initiative_id} style={{ padding: '0.75rem', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.875rem' }}>
                        <strong>{index + 1}. {init.initiative_title}</strong> {init.initiative_description && <span style={{ color: 'var(--text-muted)' }}>- {init.initiative_description}</span>}
                    </div>
                ))}
            </div>

            {isAdding ? (
                <InitiativeForm
                    keyResult={keyResult}
                    objective={objective}
                    currentEmployee={currentEmployee}
                    onCancel={() => setIsAdding(false)}
                    onSuccess={async () => {
                        setIsAdding(false);
                        await refreshInitiatives();
                    }}
                />
            ) : (
                <button
                    className="btn-primary"
                    title="Eksempel: Ringe til tre skoler som ikke har vært med tidligere og prøve engasjere de til årets aksjon."
                    onClick={() => setIsAdding(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: 'fit-content' }}
                >
                    <Plus size={16} />
                    Legg til initiative
                </button>
            )}
        </div>
    );
};

const InitiativeForm = ({ keyResult, objective, currentEmployee, onCancel, onSuccess }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [isCheckingAi, setIsCheckingAi] = useState(false);
    const [aiFeedback, setAiFeedback] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title) return;
        setLoading(true);
        try {
            await api.createInitiative({
                employee_id: currentEmployee,
                objective_id: objective.objective_id,
                key_result_id: keyResult.key_result_id,
                initiative_title: title,
                initiative_description: description,
                status: 'På skjema'
            });
            onSuccess();
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckAi = async () => {
        if (!title) {
            alert('Vennligst skriv inn en tittel før du sjekker initiativet.');
            return;
        }
        
        setIsCheckingAi(true);
        setAiFeedback(null);
        
        try {
            const response = await fetch('/api/check-initiative', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, description }),
            });
            
            if (!response.ok) {
                let errorMsg = 'Kunne ikke sjekke initiativet. Prøv igjen senere.';
                try {
                    const errData = await response.json();
                    if (errData.error) errorMsg = errData.error;
                } catch(e) {}
                throw new Error(errorMsg);
            }
            
            const data = await response.json();
            setAiFeedback(data.feedback);
        } catch (err) {
            setAiFeedback(`**Feil:** ${err.message}`);
        } finally {
            setIsCheckingAi(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ padding: '1rem', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--secondary)' }}>
            <div className="form-group">
                <label>Tittel (kort formulering)</label>
                <input className="form-control" value={title} onChange={e => setTitle(e.target.value)} required autoFocus placeholder="Hva skal du gjøre?" />
            </div>
            <div className="form-group">
                <label>Beskrivelse (valgfritt)</label>
                <textarea className="form-control" rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="Utdyp hvordan du vil løse det" />
            </div>
            
            {aiFeedback && (
                <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--background)', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--primary)' }}>
                    <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--primary)' }}>AI-Tilbakemelding:</div>
                    <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.875rem', lineHeight: '1.5' }}>
                        {aiFeedback.split('\n').map((line, i) => {
                            if (line.startsWith('**') && line.endsWith('**')) {
                                return <strong key={i} style={{ display: 'block', marginTop: i > 0 ? '0.5rem' : 0 }}>{line.replace(/\*\*/g, '')}</strong>;
                            }
                            return <span key={i} style={{ display: 'block' }}>{line.replace(/\*\*/g, '')}</span>;
                        })}
                    </div>
                </div>
            )}
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                <button type="button" className="btn-primary" style={{ backgroundColor: 'var(--text-muted)' }} onClick={onCancel} disabled={loading || isCheckingAi}>Avbryt</button>
                <button type="button" className="btn-primary" style={{ backgroundColor: '#64748b' }} onClick={handleCheckAi} disabled={loading || isCheckingAi || !title}>
                    {isCheckingAi ? 'Sjekker...' : 'Sjekk initiativ'}
                </button>
                <button type="submit" className="btn-primary" disabled={loading || isCheckingAi}>{loading ? 'Lagrer...' : 'Lagre initiative'}</button>
            </div>
        </form>
    );
};
