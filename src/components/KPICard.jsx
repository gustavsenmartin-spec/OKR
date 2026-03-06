import React from 'react';

export const KPICard = ({ title, value, description, icon: Icon, color = 'var(--primary)' }) => {
    return (
        <div className="card" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '1.5rem' }}>
            <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>
                    {title}
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                    {value}
                </div>
                {description && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {description}
                    </div>
                )}
            </div>
            {Icon && (
                <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: `${color}15`, color: color }}>
                    <Icon size={24} />
                </div>
            )}
        </div>
    );
};
