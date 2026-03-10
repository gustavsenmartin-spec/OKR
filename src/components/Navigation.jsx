import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FilePlus, Edit3, Target, Users, ListTree, Archive as ArchiveIcon } from 'lucide-react';
import './Navigation.css';

export const Navigation = () => {
    return (
        <nav className="sidebar">
            <div className="sidebar-header">
                <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>TV-aksjonen</h2>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>OKR Portal</div>
            </div>

            <div className="nav-links">
                <NavLink to="/" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    <LayoutDashboard size={20} />
                    <span>Oversikt</span>
                </NavLink>
                <NavLink to="/objectives" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    <ListTree size={20} />
                    <span>Objectives & KRs</span>
                </NavLink>
                <NavLink to="/register" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    <FilePlus size={20} />
                    <span>Registrer initiatives</span>
                </NavLink>
                <NavLink to="/update" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    <Edit3 size={20} />
                    <span>Oppdater mine</span>
                </NavLink>
                <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    <Target size={20} />
                    <span>Dashboard</span>
                </NavLink>
                <NavLink to="/employees" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    <Users size={20} />
                    <span>Ansatte</span>
                </NavLink>
                <NavLink to="/archive" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    <ArchiveIcon size={20} />
                    <span>Arkiv</span>
                </NavLink>
            </div>
        </nav>
    );
};
