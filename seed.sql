-- 1. Opprett 'employees' tabell
CREATE TABLE IF NOT EXISTS employees (
    employee_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    department TEXT,
    active BOOLEAN DEFAULT true
);

-- 2. Opprett 'objectives' tabell
CREATE TABLE IF NOT EXISTS objectives (
    objective_id TEXT PRIMARY KEY,
    objective_code TEXT NOT NULL,
    objective_title TEXT NOT NULL,
    objective_description TEXT,
    sort_order INTEGER NOT NULL
);

-- 3. Opprett 'key_results' tabell
CREATE TABLE IF NOT EXISTS key_results (
    key_result_id TEXT PRIMARY KEY,
    objective_id TEXT NOT NULL REFERENCES objectives(objective_id) ON DELETE CASCADE,
    key_result_code TEXT NOT NULL,
    full_code TEXT NOT NULL,
    key_result_title TEXT NOT NULL,
    baseline_value TEXT,
    target_value TEXT,
    unit TEXT,
    sort_order INTEGER NOT NULL
);

-- 4. Opprett 'initiatives' tabell
CREATE TABLE IF NOT EXISTS initiatives (
    initiative_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
    objective_id TEXT NOT NULL REFERENCES objectives(objective_id) ON DELETE CASCADE,
    key_result_id TEXT NOT NULL REFERENCES key_results(key_result_id) ON DELETE CASCADE,
    initiative_title TEXT NOT NULL,
    initiative_description TEXT,
    status TEXT NOT NULL CHECK (status IN ('Bak skjema', 'På skjema', 'Foran skjema', 'Ferdig')),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    due_date DATE,
    is_active BOOLEAN DEFAULT true
);

-- 5. Tøm tabellene (i tilfelle de finnes fra før for å unngå duplikater ved re-kjøring)
TRUNCATE TABLE initiatives CASCADE;
TRUNCATE TABLE key_results CASCADE;
TRUNCATE TABLE objectives CASCADE;
TRUNCATE TABLE employees CASCADE;

-- 6. Sett inn Employees
-- Merk: Hvis du vil bruke en bestemt ID for demobrukeren kan vi la systemet generere UUID, 
-- men for mock-dataens skyld kan vi tvinge inn en ID her.
INSERT INTO employees (employee_id, name, email, department, active) VALUES
('11111111-1111-1111-1111-111111111111', 'Demo Bruker', 'demo@tvaksjonen.no', 'Ledelsen', true);

-- 7. Sett inn Objectives (O1-O4)
INSERT INTO objectives (objective_id, objective_code, objective_title, sort_order) VALUES
('O1', 'O1', 'Vi rekrutterer og aktiverer flere bøssebærere', 1),
('O2', 'O2', 'Vi gjør organiseringen av bøsseaksjonen enklere', 2),
('O3', 'O3', 'Flere skoler og barnehager velger TV-aksjonen', 3),
('O4', 'O4', 'Inntektene fra næringslivet øker', 4);

-- 8. Sett inn Key Results for O1
INSERT INTO key_results (key_result_id, objective_id, key_result_code, full_code, key_result_title, sort_order) VALUES
('KR1-1', 'O1', 'KR1', 'O1-KR1', 'Antall som har vært bøssebærer tidligere og er registrert i Aksjonsportalen skal øke fra 12,7% til 20%', 1),
('KR1-2', 'O1', 'KR2', 'O1-KR2', '23 000 bøssebærere registrerer seg på tvaksjonen.no (2025: 14 300)', 2),
('KR1-3', 'O1', 'KR3', 'O1-KR3', 'Kjennskap til at TV-aksjonen går til NRC Flyktninghjelpen / hjem til mennesker på flukt i 2026 skal øke fra 21% til 35%', 3),
('KR1-4', 'O1', 'KR4', 'O1-KR4', 'Totalt antall bøssebærere øker fra 28 000 til 38 000', 4);

-- 9. Sett inn Key Results for O2
INSERT INTO key_results (key_result_id, objective_id, key_result_code, full_code, key_result_title, sort_order) VALUES
('KR2-1', 'O2', 'KR1', 'O2-KR1', 'Andel kommuner med minst 3 påmeldte bøssebærere på minimum ett oppmøtested skal øke fra ca. 95% til 97%', 1),
('KR2-2', 'O2', 'KR2', 'O2-KR2', 'Digitale kommuner skal gå fra 32 til færre enn 30', 2),
('KR2-3', 'O2', 'KR3', 'O2-KR3', 'Tilfredshet med verktøy og støtte fra TV-aksjonen skal øke fra 4,3 til 4,5 (Questback)', 3),
('KR2-4', 'O2', 'KR4', 'O2-KR4', 'Minimum 70% av dem som var frivillige ledere (område/base/oppmøtested) i 2025 skal bli med i 2026', 4);

-- 10. Sett inn Key Results for O3
INSERT INTO key_results (key_result_id, objective_id, key_result_code, full_code, key_result_title, sort_order) VALUES
('KR3-1', 'O3', 'KR1', 'O3-KR1', 'Antall skoler som deltar med inntektsbringende aktivitet skal øke fra 852 til 900', 1),
('KR3-2', 'O3', 'KR2', 'O3-KR2', 'Antall skoler som er innom Salaby TV-aksjonen skal øke fra 2058 til 2200', 2),
('KR3-3', 'O3', 'KR3', 'O3-KR3', 'Antall skoler som gir over 50.000 skal øke fra 188 til minimum 210', 3),
('KR3-4', 'O3', 'KR4', 'O3-KR4', 'Totalbeløp fra skoler og barnehager øker fra 29,8 millioner i 2025 til 32,3 millioner i 2026', 4);

-- 11. Sett inn Key Results for O4
INSERT INTO key_results (key_result_id, objective_id, key_result_code, full_code, key_result_title, sort_order) VALUES
('KR4-1', 'O4', 'KR1', 'O4-KR1', 'Antall kommuner som er inkludert i en ringedugnad øker fra 180 til 200', 1),
('KR4-2', 'O4', 'KR2', 'O4-KR2', 'Antall donasjoner fra næringslivet skal øke fra 6888 til minst 7500', 2),
('KR4-3', 'O4', 'KR3', 'O4-KR3', 'Antall donasjoner fra næringslivet over 50.000 skal øke fra 144 til minst 160', 3),
('KR4-4', 'O4', 'KR4', 'O4-KR4', 'Donasjoner fra næringslivet øker fra 52 millioner i 2025 til minst 58,7 millioner i 2026', 4);
