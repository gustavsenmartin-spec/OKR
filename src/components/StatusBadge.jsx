import React from 'react';

export const StatusBadge = ({ status }) => {
    let color = 'var(--text-muted)';
    let bg = '#F1F5F9';

    switch (status) {
        case 'Bak skjema':
            color = 'var(--status-behind)';
            bg = '#FEE2E2';
            break;
        case 'På skjema':
            color = 'var(--status-on-track)';
            bg = '#FEF3C7';
            break;
        case 'Foran skjema':
            color = 'var(--status-ahead)';
            bg = '#D1FAE5';
            break;
        case 'Ferdig':
        case 'Fullført':
            color = 'var(--status-done)';
            bg = '#DBEAFE';
            break;
        case 'Ikke fullført, men arkiveres':
            color = '#475569';
            bg = '#E2E8F0';
            break;
        case 'Ikke fullført, videreføres til neste periode':
            color = '#7C3AED';
            bg = '#EDE9FE';
            break;
        default:
            bg = '#F1F5F9';
    }

    return (
        <span className="badge" style={{ backgroundColor: bg, color: color }}>
            {status}
        </span>
    );
};
