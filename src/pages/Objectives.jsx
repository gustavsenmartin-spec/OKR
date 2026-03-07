import React from 'react';
import { useData } from '../context/DataContext';

export const Objectives = () => {
    const { objectives, keyResults, loading } = useData();

    if (loading) return <div className="page">Laster data...</div>;

    return (
        <div className="page" style={{ maxWidth: '1000px' }}>
            <h2>Objectives og Key Results</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Oversikt over TV-aksjonens felles mål frem mot mai 2026.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {objectives.map(obj => {
                    const objKRs = keyResults.filter(kr => kr.objective_id === obj.objective_id);

                    return (
                        <div key={obj.objective_id} className="card" style={{ borderLeft: '4px solid var(--secondary)' }}>
                            <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                                <div style={{ display: 'inline-block', backgroundColor: 'var(--secondary)', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                    {obj.objective_code}
                                </div>
                                <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--primary)' }}>{obj.objective_title}</h3>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                                {objKRs.map(kr => (
                                    <div key={kr.key_result_id} style={{ backgroundColor: 'var(--background)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                                        <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>{kr.full_code}</div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{kr.key_result_title}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
