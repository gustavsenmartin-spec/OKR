import React from 'react';
import { useData } from '../context/DataContext';
import { KPICard } from '../components/KPICard';
import { Target, ListTodo, Users, CheckCircle2 } from 'lucide-react';

const StatusRow = ({ label, count, total, color }) => {
    const percent = total > 0 ? (count / total) * 100 : 0;
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                <span>{label}</span>
                <span style={{ fontWeight: 600 }}>{count} ({Math.round(percent)}%)</span>
            </div>
            <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--background)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${percent}%`, height: '100%', backgroundColor: color }} />
            </div>
        </div>
    );
};

export const Overview = () => {
    const { objectives, keyResults, initiatives, employees, loading } = useData();

    if (loading) return <div>Laster data...</div>;

    const employeeWithInits = new Set(initiatives.map(i => i.employee_id)).size;
    const noInits = employees.length - employeeWithInits;

    const countStatus = (status) => initiatives.filter(i => i.status === status).length;

    return (
        <div className="page">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2>Oversikt over OKR</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Frist for registrering av initiativer: <strong>før påske</strong></p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <KPICard title="Objectives" value={objectives.length} icon={Target} />
                <KPICard title="Key Results" value={keyResults.length} icon={CheckCircle2} color="var(--status-ahead)" />
                <KPICard title="Totalt antall Initiatives" value={initiatives.length} icon={ListTodo} color="var(--status-done)" />
                <KPICard title="Ansatte med Initiatives" value={employeeWithInits} description={`Manglende registrering på ${noInits} ansatte`} icon={Users} color="var(--status-on-track)" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '2rem' }}>
                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem' }}>Statusfordeling</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <StatusRow label="Bak skjema" count={countStatus('Bak skjema')} total={initiatives.length} color="var(--status-behind)" />
                        <StatusRow label="På skjema" count={countStatus('På skjema')} total={initiatives.length} color="var(--status-on-track)" />
                        <StatusRow label="Foran skjema" count={countStatus('Foran skjema')} total={initiatives.length} color="var(--status-ahead)" />
                        <StatusRow label="Ferdig" count={countStatus('Ferdig')} total={initiatives.length} color="var(--status-done)" />
                    </div>
                </div>

                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem' }}>Initiatives per Objective</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {objectives.map(obj => {
                            const count = initiatives.filter(i => i.objective_id === obj.objective_id).length;
                            return (
                                <div key={obj.objective_id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                                    <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>
                                        <strong>{obj.objective_code}:</strong> {obj.objective_title}
                                    </div>
                                    <div style={{ fontWeight: 600, color: 'var(--primary)', backgroundColor: 'var(--background)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', marginLeft: '1rem' }}>
                                        {count}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
