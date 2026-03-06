import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
    const [employees, setEmployees] = useState([]);
    const [objectives, setObjectives] = useState([]);
    const [keyResults, setKeyResults] = useState([]);
    const [initiatives, setInitiatives] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentEmployee, setCurrentEmployee] = useState(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const [emps, objs, krs, inits] = await Promise.all([
                api.getEmployees(),
                api.getObjectives(),
                api.getKeyResults(),
                api.getInitiatives()
            ]);
            setEmployees(emps);
            setObjectives(objs);
            setKeyResults(krs);
            setInitiatives(inits);
        } catch (e) {
            console.error("Failed loading internal OKR DB", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const refreshInitiatives = async () => {
        const inits = await api.getInitiatives();
        setInitiatives(inits);
    };

    const refreshEmployees = async () => {
        const emps = await api.getEmployees();
        setEmployees(emps);
    };

    return (
        <DataContext.Provider value={{
            employees, objectives, keyResults, initiatives, loading,
            currentEmployee, setCurrentEmployee,
            refreshInitiatives, refreshEmployees
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => useContext(DataContext);
