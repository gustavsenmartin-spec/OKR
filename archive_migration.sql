-- 1. Drop the old enum/check constraint for status
ALTER TABLE initiatives DROP CONSTRAINT IF EXISTS initiatives_status_check;

-- 2. Add the new constraint with all valid statuses
ALTER TABLE initiatives ADD CONSTRAINT initiatives_status_check 
CHECK (status IN (
    'Bak skjema', 
    'På skjema', 
    'Foran skjema', 
    'Fullført', 
    'Ikke fullført, men arkiveres', 
    'Ikke fullført, videreføres til neste periode'
));

-- 3. Add new columns for the archive functionality
ALTER TABLE initiatives ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;
ALTER TABLE initiatives ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE initiatives ADD COLUMN IF NOT EXISTS archived_by TEXT;
ALTER TABLE initiatives ADD COLUMN IF NOT EXISTS archive_batch_id TEXT;
ALTER TABLE initiatives ADD COLUMN IF NOT EXISTS period_label TEXT;
ALTER TABLE initiatives ADD COLUMN IF NOT EXISTS carried_forward BOOLEAN DEFAULT false;

-- 4. Migrate old data
UPDATE initiatives SET status = 'Fullført' WHERE status = 'Ferdig';
