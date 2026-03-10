import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { KPICard } from '../components/KPICard';
import { StatusBadge } from '../components/StatusBadge';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { Download, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const STATUS_COLORS = {
    'Bak skjema': '#EF4444',
    'På skjema': '#F59E0B',
    'Foran skjema': '#10B981',
    'Ferdig': '#3B82F6'
};

export const Dashboard = () => {
    const { employees, objectives, keyResults, initiatives, loading } = useData();

    const [filterObj, setFilterObj] = useState('');
    const [filterKR, setFilterKR] = useState('');
    const [filterEmp, setFilterEmp] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterDep, setFilterDep] = useState('');

    // Sorting state
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    // Collapsible states
    const [showCharts, setShowCharts] = useState(false);
    const [showEmpTable, setShowEmpTable] = useState(false);
    const [showObjTable, setShowObjTable] = useState(false);
    const [showInitTable, setShowInitTable] = useState(false);

    // Filtering Logic
    const filteredInitiatives = useMemo(() => {
        return initiatives.filter(i => {
            if (filterObj && i.objective_id !== filterObj) return false;
            if (filterKR && i.key_result_id !== filterKR) return false;
            if (filterEmp && i.employee_id !== filterEmp) return false;
            if (filterStatus && i.status !== filterStatus) return false;
            if (filterDep) {
                const emp = employees.find(e => e.employee_id === i.employee_id);
                if (!emp || emp.department !== filterDep) return false;
            }
            return true;
        });
    }, [initiatives, filterObj, filterKR, filterEmp, filterStatus, filterDep, employees]);

    // Sorting Logic
    const sortedInitiatives = useMemo(() => {
        let sortableItems = [...filteredInitiatives];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // For mapped values like Employee Name and Key Result Code
                if (sortConfig.key === 'employee_name') {
                    aValue = employees.find(e => e.employee_id === a.employee_id)?.name || '';
                    bValue = employees.find(e => e.employee_id === b.employee_id)?.name || '';
                } else if (sortConfig.key === 'kr_code') {
                    aValue = keyResults.find(k => k.key_result_id === a.key_result_id)?.full_code || '';
                    bValue = keyResults.find(k => k.key_result_id === b.key_result_id)?.full_code || '';
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [filteredInitiatives, sortConfig, employees, keyResults]);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (columnKey) => {
        if (sortConfig.key !== columnKey) return <ArrowUpDown size={14} style={{ marginLeft: '4px', opacity: 0.5 }} />;
        if (sortConfig.direction === 'asc') return <ChevronUp size={14} style={{ marginLeft: '4px' }} />;
        return <ChevronDown size={14} style={{ marginLeft: '4px' }} />;
    };

    // Derived metrics
    const total = filteredInitiatives.length;
    const finished = filteredInitiatives.filter(i => i.status === 'Ferdig').length;
    const behind = filteredInitiatives.filter(i => i.status === 'Bak skjema').length;
    const completionRate = total > 0 ? Math.round((finished / total) * 100) : 0;
    const empsWithObj = new Set(filteredInitiatives.map(i => i.employee_id)).size;

    // Chart Data: Status Pie
    const statusData = useMemo(() => {
        const counts = {};
        Object.keys(STATUS_COLORS).forEach(s => counts[s] = 0);
        filteredInitiatives.forEach(i => counts[i.status]++);
        return Object.entries(counts).map(([name, value]) => ({ name, value })).filter(d => d.value > 0);
    }, [filteredInitiatives]);

    // Chart Data: Initiatives per Objective
    const objData = useMemo(() => {
        return objectives
            .filter(o => !filterObj || o.objective_id === filterObj)
            .map(o => ({
                name: o.objective_code,
                fullTitle: o.objective_title,
                initiatives: filteredInitiatives.filter(i => i.objective_id === o.objective_id).length
            }));
    }, [objectives, filteredInitiatives, filterObj]);

    // Employee Table Data
    const empTableData = useMemo(() => {
        return employees
            .filter(e => !filterEmp || e.employee_id === filterEmp)
            .filter(e => !filterDep || e.department === filterDep)
            .map(e => {
                const myInits = filteredInitiatives.filter(i => i.employee_id === e.employee_id);
                const ferdig = myInits.filter(i => i.status === 'Ferdig').length;
                const bak = myInits.filter(i => i.status === 'Bak skjema').length;
                const pa = myInits.filter(i => i.status === 'På skjema').length;
                const foran = myInits.filter(i => i.status === 'Foran skjema').length;
                return { ...e, total: myInits.length, ferdig, bak, pa, foran };
            })
            .filter(e => e.total > 0 || filterEmp);
    }, [employees, filteredInitiatives, filterEmp, filterDep]);

    // Objective Table Data
    const objTableData = useMemo(() => {
        return objectives
            .filter(o => !filterObj || o.objective_id === filterObj)
            .map(o => {
                const myInits = filteredInitiatives.filter(i => i.objective_id === o.objective_id);
                const ferdig = myInits.filter(i => i.status === 'Ferdig').length;
                const bak = myInits.filter(i => i.status === 'Bak skjema').length;
                const pa = myInits.filter(i => i.status === 'På skjema').length;
                const foran = myInits.filter(i => i.status === 'Foran skjema').length;
                return { ...o, total: myInits.length, ferdig, bak, pa, foran };
            })
            .filter(o => o.total > 0 || filterObj);
    }, [objectives, filteredInitiatives, filterObj]);

    // Auto-filtering KR based on selected Obj
    const visibleKRs = useMemo(() => {
        if (!filterObj) return keyResults;
        return keyResults.filter(kr => kr.objective_id === filterObj);
    }, [keyResults, filterObj]);

    // Auto-filtering Employees based on selected Department
    const visibleEmployees = useMemo(() => {
        if (!filterDep) return employees;
        return employees.filter(e => e.department === filterDep);
    }, [employees, filterDep]);

    const handleExportCSV = () => {
        const headers = ['Ansatt', 'Objective', 'Key Result', 'Initiative', 'Status', 'Dato endret', 'Kommentar'];

        const rows = filteredInitiatives.map(init => {
            const emp = employees.find(e => e.employee_id === init.employee_id)?.name || '';
            const obj = objectives.find(o => o.objective_id === init.objective_id)?.objective_code || '';
            const kr = keyResults.find(k => k.key_result_id === init.key_result_id)?.full_code || '';
            const dt = new Date(init.updated_at).toLocaleDateString('no-NO');

            return [
                `"${emp}"`,
                `"${obj}"`,
                `"${kr}"`,
                `"${init.initiative_title.replace(/"/g, '""')}"`,
                `"${init.status}"`,
                `"${dt}"`,
                `"${(init.comment || '').replace(/"/g, '""')}"`
            ].join(',');
        });

        // Use BOM for Excel UTF-8 display compatibility
        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'initiatives_eksport.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportPDF = () => {
        const doc = new jsPDF('landscape'); // Landscape to fit more columns

        doc.text("TV-aksjonen OKR Initiatives", 14, 15);

        const tableData = filteredInitiatives.map(init => {
            const emp = employees.find(e => e.employee_id === init.employee_id)?.name || '';
            const obj = objectives.find(o => o.objective_id === init.objective_id)?.objective_code || '';
            const kr = keyResults.find(k => k.key_result_id === init.key_result_id)?.full_code || '';
            const dt = new Date(init.updated_at).toLocaleDateString('no-NO');
            const comment = init.comment || '';
            return [emp, obj, kr, init.initiative_title, init.status, dt, comment];
        });

        autoTable(doc, {
            startY: 20,
            head: [['Ansatt', 'Objective', 'Key Result', 'Initiative', 'Status', 'Dato endret', 'Kommentar']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [15, 23, 42] } // Primary color (Deep Navy)
        });

        doc.save('initiatives_eksport.pdf');
    };

    if (loading) return <div className="page">Laster data...</div>;

    return (
        <div className="page" style={{ maxWidth: '1400px' }}>
            <h2>Ledelsens Dashboard</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Aggregert oversikt over fremdrift og OKR-status.</p>

            {/* Filters */}
            <div className="card" style={{ marginBottom: '2rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', backgroundColor: 'var(--surface)' }}>
                {/* Column 1 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Objective</label>
                        <select className="form-control" value={filterObj} onChange={(e) => { setFilterObj(e.target.value); setFilterKR(''); }}>
                            <option value="">Alle Objectives</option>
                            {objectives.map(o => <option key={o.objective_id} value={o.objective_id}>{o.objective_code} - {o.objective_title.substring(0, 30)}...</option>)}
                        </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Key Result</label>
                        <select className="form-control" value={filterKR} onChange={(e) => setFilterKR(e.target.value)}>
                            <option value="">Alle Key Results</option>
                            {visibleKRs.map(kr => <option key={kr.key_result_id} value={kr.key_result_id}>{kr.full_code}</option>)}
                        </select>
                    </div>
                </div>

                {/* Column 2 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Avdeling</label>
                        <select className="form-control" value={filterDep} onChange={(e) => { setFilterDep(e.target.value); setFilterEmp(''); }}>
                            <option value="">Alle avdelinger</option>
                            <option value="Nasjonalt">Nasjonalt</option>
                            <option value="Kystregionen">Kystregionen</option>
                            <option value="Region Øst +">Region Øst +</option>
                        </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Ansatt</label>
                        <select className="form-control" value={filterEmp} onChange={(e) => setFilterEmp(e.target.value)}>
                            <option value="">Alle Ansatte</option>
                            {visibleEmployees.map(e => <option key={e.employee_id} value={e.employee_id}>{e.name}</option>)}
                        </select>
                    </div>
                </div>

                {/* Column 3 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Status</label>
                        <select className="form-control" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                            <option value="">Alle statuser</option>
                            {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>

                {/* Column 4 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ visibility: 'hidden' }}>Nullstill</label>
                        <button
                            className="btn-primary"
                            style={{
                                backgroundColor: 'var(--surface)',
                                color: 'var(--text-main)',
                                border: '1px solid var(--border)',
                                borderBottom: '3px solid var(--text-muted)',
                                padding: '0.75rem',
                                borderRadius: 'var(--radius-md)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 600,
                                transition: 'all 0.1s',
                                cursor: 'pointer'
                            }}
                            onMouseDown={(e) => {
                                e.currentTarget.style.transform = 'translateY(2px)';
                                e.currentTarget.style.borderBottomWidth = '1px';
                            }}
                            onMouseUp={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.borderBottomWidth = '3px';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.borderBottomWidth = '3px';
                            }}
                            onClick={() => {
                                setFilterObj('');
                                setFilterKR('');
                                setFilterDep('');
                                setFilterEmp('');
                                setFilterStatus('');
                            }}
                        >
                            Nullstill alle filter
                        </button>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <KPICard title="Totalt Initiatives" value={total} color="var(--primary)" />
                <KPICard title="Ferdig i %" value={`${completionRate}%`} description={`${finished} av ${total}`} color="var(--status-done)" />
                <KPICard title="Bak skjema" value={behind} color="var(--status-behind)" />
                <KPICard title="Aktive ansatte" value={empsWithObj} color="var(--status-on-track)" />
            </div>

            {/* Charts */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <div
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: showCharts ? '1.5rem' : 0 }}
                    onClick={() => setShowCharts(!showCharts)}
                >
                    <h3 style={{ margin: 0 }}>Diagrammer og nullpunktsanalyse</h3>
                    {showCharts ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
                {showCharts && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '2rem' }}>
                        <div>
                            <h4 style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '1rem' }}>Initiatives per Objective</h4>
                            <div style={{ height: '300px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={objData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                        <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)' }} />
                                        <YAxis allowDecimals={false} tick={{ fill: 'var(--text-muted)' }} />
                                        <RechartsTooltip cursor={{ fill: 'var(--background)' }} contentStyle={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }} />
                                        <Bar dataKey="initiatives" fill="var(--secondary)" radius={[4, 4, 0, 0]} name="Antall Initiatives" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div>
                            <h4 style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '1rem' }}>Statusfordeling</h4>
                            <div style={{ height: '300px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={statusData} innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                                            {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name]} />)}
                                        </Pie>
                                        <RechartsTooltip contentStyle={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }} />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Tables */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <div
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: showEmpTable ? '1.5rem' : 0 }}
                    onClick={() => setShowEmpTable(!showEmpTable)}
                >
                    <h3 style={{ margin: 0 }}>Ansattoversikt (Aggregert)</h3>
                    {showEmpTable ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
                {showEmpTable && (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ minWidth: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-muted)' }}>
                                    <th style={{ padding: '0.75rem' }}>Ansatt</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>Totalt</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'center', color: 'var(--status-done)' }}>Ferdig</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'center', color: 'var(--status-ahead)' }}>Foran skjema</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'center', color: 'var(--status-on-track)' }}>På skjema</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'center', color: 'var(--status-behind)' }}>Bak skjema</th>
                                </tr>
                            </thead>
                            <tbody>
                                {empTableData.map(e => (
                                    <tr key={e.employee_id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '0.75rem', fontWeight: 500 }}>{e.name}</td>
                                        <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 600 }}>{e.total}</td>
                                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>{e.ferdig}</td>
                                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>{e.foran}</td>
                                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>{e.pa}</td>
                                        <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: e.bak > 0 ? 600 : 400, color: e.bak > 0 ? 'var(--status-behind)' : 'inherit' }}>{e.bak}</td>
                                    </tr>
                                ))}
                                {empTableData.length === 0 && (
                                    <tr>
                                        <td colSpan="6" style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>Ingen ansatte å vise med disse filtrene.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <div
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: showObjTable ? '1.5rem' : 0 }}
                    onClick={() => setShowObjTable(!showObjTable)}
                >
                    <h3 style={{ margin: 0 }}>Objectiveoversikt (Aggregert)</h3>
                    {showObjTable ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
                {showObjTable && (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ minWidth: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-muted)' }}>
                                    <th style={{ padding: '0.75rem' }}>Objective</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>Totalt</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'center', color: 'var(--status-done)' }}>Ferdig</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'center', color: 'var(--status-ahead)' }}>Foran skjema</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'center', color: 'var(--status-on-track)' }}>På skjema</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'center', color: 'var(--status-behind)' }}>Bak skjema</th>
                                </tr>
                            </thead>
                            <tbody>
                                {objTableData.map(o => (
                                    <tr key={o.objective_id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '0.75rem', fontWeight: 500 }}>{o.objective_code} - {o.objective_title}</td>
                                        <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 600 }}>{o.total}</td>
                                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>{o.ferdig}</td>
                                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>{o.foran}</td>
                                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>{o.pa}</td>
                                        <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: o.bak > 0 ? 600 : 400, color: o.bak > 0 ? 'var(--status-behind)' : 'inherit' }}>{o.bak}</td>
                                    </tr>
                                ))}
                                {objTableData.length === 0 && (
                                    <tr>
                                        <td colSpan="6" style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>Ingen objectives å vise med disse filtrene.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="card">
                <div
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: showInitTable ? '1.5rem' : 0 }}
                    onClick={() => setShowInitTable(!showInitTable)}
                >
                    <h3 style={{ margin: 0 }}>Detaljliste initiatives</h3>
                    {showInitTable ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>

                {showInitTable && (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button className="btn-primary" onClick={handleExportCSV} style={{ backgroundColor: 'var(--surface)', color: 'var(--primary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Download size={16} /> Til CSV
                                </button>
                                <button className="btn-primary" onClick={handleExportPDF} style={{ backgroundColor: 'var(--surface)', color: 'var(--primary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Download size={16} /> Til PDF
                                </button>
                            </div>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ minWidth: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-muted)' }}>
                                        <th style={{ padding: '0.75rem', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('employee_name')}>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>Ansatt {getSortIcon('employee_name')}</div>
                                        </th>
                                        <th style={{ padding: '0.75rem', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('kr_code')}>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>O/KR {getSortIcon('kr_code')}</div>
                                        </th>
                                        <th style={{ padding: '0.75rem', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('initiative_title')}>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>Initiative {getSortIcon('initiative_title')}</div>
                                        </th>
                                        <th style={{ padding: '0.75rem', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('status')}>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>Status {getSortIcon('status')}</div>
                                        </th>
                                        <th style={{ padding: '0.75rem', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('updated_at')}>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>Dato endret {getSortIcon('updated_at')}</div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedInitiatives.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Ingen data å vise med dagens filtre.</td>
                                        </tr>
                                    ) : (
                                        sortedInitiatives.map(init => {
                                            const emp = employees.find(e => e.employee_id === init.employee_id);
                                            const kr = keyResults.find(k => k.key_result_id === init.key_result_id);
                                            const dt = new Date(init.updated_at).toLocaleDateString('no-NO');

                                            return (
                                                <tr key={init.initiative_id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                    <td style={{ padding: '0.75rem', fontWeight: 500 }}>{emp?.name}</td>
                                                    <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>{kr?.full_code}</td>
                                                    <td style={{ padding: '0.75rem' }}>
                                                        <div style={{ fontWeight: 500 }}>{init.initiative_title}</div>
                                                        {init.comment && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>💬 {init.comment}</div>}
                                                    </td>
                                                    <td style={{ padding: '0.75rem' }}><StatusBadge status={init.status} /></td>
                                                    <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>{dt}</td>
                                                </tr>
                                            )
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>

        </div>
    );
};
