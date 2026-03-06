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
            color = 'var(--status-done)';
            bg = '#DBEAFE';
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
