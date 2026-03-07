import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn("⚠️ Mangler Supabase miljøvariabler i .env / Vercel. Sørg for at VITE_SUPABASE_URL og VITE_SUPABASE_ANON_KEY er satt.");
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder');

export const api = {
    // --- Employees ---
    getEmployees: async () => {
        const { data, error } = await supabase
            .from('employees')
            .select('*')
            .eq('active', true);

        if (error) throw new Error(error.message);
        return data || [];
    },

    createEmployee: async (employeeData) => {
        const { data, error } = await supabase
            .from('employees')
            .insert([employeeData])
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    },

    // --- OKR Data ---
    getObjectives: async () => {
        const { data, error } = await supabase
            .from('objectives')
            .select('*')
            .order('sort_order', { ascending: true });

        if (error) throw new Error(error.message);
        return data || [];
    },

    getKeyResults: async () => {
        const { data, error } = await supabase
            .from('key_results')
            .select('*')
            .order('sort_order', { ascending: true });

        if (error) throw new Error(error.message);
        return data || [];
    },

    // --- Initiatives ---
    getInitiatives: async (filters = {}) => {
        let query = supabase
            .from('initiatives')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (filters.employee_id) {
            query = query.eq('employee_id', filters.employee_id);
        }
        if (filters.objective_id) {
            query = query.eq('objective_id', filters.objective_id);
        }
        if (filters.key_result_id) {
            query = query.eq('key_result_id', filters.key_result_id);
        }
        if (filters.status) {
            query = query.eq('status', filters.status);
        }

        const { data, error } = await query;
        if (error) throw new Error(error.message);
        return data || [];
    },

    createInitiative: async (initiativeData) => {
        const { data, error } = await supabase
            .from('initiatives')
            .insert([{
                ...initiativeData,
                status: initiativeData.status || 'På skjema'
            }])
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    },

    updateInitiative: async (initiative_id, updates) => {
        const { data, error } = await supabase
            .from('initiatives')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('initiative_id', initiative_id)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    },

    deleteInitiative: async (initiative_id) => {
        const { error } = await supabase
            .from('initiatives')
            .delete()
            .eq('initiative_id', initiative_id);

        if (error) throw new Error(error.message);
        return true;
    }
};
