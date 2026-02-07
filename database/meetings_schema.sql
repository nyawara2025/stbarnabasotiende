-- Meeting Minutes & Financial Tracking System
-- Multi-tenant schema with org_id support

-- ============================================
-- TABLE: meetings
-- Stores meeting records with agenda, minutes, action items
-- ============================================
CREATE TABLE IF NOT EXISTS public.meetings (
    id SERIAL PRIMARY KEY,
    org_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    meeting_date TIMESTAMP NOT NULL,
    venue VARCHAR(255),
    agenda TEXT,
    minutes_content TEXT,
    attendees JSONB DEFAULT '[]', -- Array of attendee names/IDs
    absent_apologies JSONB DEFAULT '[]',
    action_items JSONB DEFAULT '[]', -- [{task, owner, due_date, status}]
    status VARCHAR(20) DEFAULT 'DRAFT', -- DRAFT, PUBLISHED, ARCHIVED
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast org filtering
CREATE INDEX idx_meetings_org_id ON public.meetings(org_id);
CREATE INDEX idx_meetings_date ON public.meetings(meeting_date DESC);
CREATE INDEX idx_meetings_status ON public.meetings(status);

-- ============================================
-- TABLE: meeting_contributions
-- Records financial contributions during meetings
-- ============================================
CREATE TABLE IF NOT EXISTS public.meeting_contributions (
    id SERIAL PRIMARY KEY,
    org_id INTEGER NOT NULL,
    meeting_id INTEGER REFERENCES public.meetings(id) ON DELETE CASCADE,
    member_id INTEGER,
    member_name VARCHAR(255) NOT NULL,
    contribution_type VARCHAR(50) NOT NULL, -- 'HOSTING', 'FOOD', 'REFRESHMENTS', 'MONTHLY_CONTRIBUTION', 'OTHER'
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'KES',
    payment_method VARCHAR(50), -- 'CASH', 'MPESA', 'BANK', 'OTHER'
    transaction_reference VARCHAR(100),
    notes TEXT,
    recorded_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for fast filtering
CREATE INDEX idx_contributions_org_id ON public.meeting_contributions(org_id);
CREATE INDEX idx_contributions_meeting_id ON public.meeting_contributions(meeting_id);
CREATE INDEX idx_contributions_member_id ON public.meeting_contributions(member_id);
CREATE INDEX idx_contributions_type ON public.meeting_contributions(contribution_type);

-- ============================================
-- TABLE: meeting_attendance
-- Tracks meeting attendance
-- ============================================
CREATE TABLE IF NOT EXISTS public.meeting_attendance (
    id SERIAL PRIMARY KEY,
    org_id INTEGER NOT NULL,
    meeting_id INTEGER REFERENCES public.meetings(id) ON DELETE CASCADE,
    member_id INTEGER,
    member_name VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'PRESENT', 'ABSENT', 'APOLOGY'
    arrival_time TIMESTAMP,
    departure_time TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_attendance_org_id ON public.meeting_attendance(org_id);
CREATE INDEX idx_attendance_meeting_id ON public.meeting_attendance(meeting_id);
CREATE INDEX idx_attendance_status ON public.meeting_attendance(status);

-- ============================================
-- TABLE: meeting_documents
-- Stores document references (PDFs, etc.)
-- ============================================
CREATE TABLE IF NOT EXISTS public.meeting_documents (
    id SERIAL PRIMARY KEY,
    org_id INTEGER NOT NULL,
    meeting_id INTEGER REFERENCES public.meetings(id) ON DELETE CASCADE,
    document_name VARCHAR(255) NOT NULL,
    document_url TEXT,
    document_type VARCHAR(50), -- 'MINUTES', 'AGENDA', 'REPORT', 'POLICY', 'OTHER'
    file_size_bytes INTEGER,
    uploaded_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_documents_org_id ON public.meeting_documents(org_id);
CREATE INDEX idx_documents_meeting_id ON public.meeting_documents(meeting_id);
CREATE INDEX idx_documents_type ON public.meeting_documents(document_type);

-- ============================================
-- VIEWS FOR REPORTING
-- ============================================

-- View: Meeting summary with contribution totals
CREATE OR REPLACE VIEW public.meetings_summary AS
SELECT 
    m.id,
    m.org_id,
    m.title,
    m.meeting_date,
    m.venue,
    m.status,
    m.attendees,
    COALESCE(SUM(mc.amount), 0) AS total_contributions,
    COUNT(DISTINCT mc.id) AS contribution_count,
    COUNT(DISTINCT ma.id) AS attendance_count,
    COALESCE(
        (SELECT COUNT(*) FROM jsonb_array_elements(m.action_items) AS item WHERE item->>'status' = 'PENDING'),
        0
    ) AS pending_action_items
FROM public.meetings m
LEFT JOIN public.meeting_contributions mc ON mc.meeting_id = m.id
LEFT JOIN public.meeting_attendance ma ON ma.meeting_id = m.id
GROUP BY m.id;

-- View: Contribution summary by type
CREATE OR REPLACE VIEW public.contributions_by_type AS
SELECT 
    org_id,
    meeting_id,
    contribution_type,
    COUNT(*) AS transaction_count,
    SUM(amount) AS total_amount
FROM public.meeting_contributions
GROUP BY org_id, meeting_id, contribution_type;

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================
-- INSERT INTO public.meetings (org_id, title, meeting_date, venue, status) 
-- VALUES (1, 'January 2026 Monthly Meeting', '2026-01-15 10:00:00', 'Community Hall', 'PUBLISHED');

-- ============================================
-- API FUNCTIONS (PostgreSQL functions for N8N)
-- ============================================

-- Function: Get all meetings for an organization
CREATE OR REPLACE FUNCTION get_meetings(p_org_id INTEGER, p_limit INTEGER DEFAULT 50, p_offset INTEGER DEFAULT 0)
RETURNS TABLE (
    id INTEGER,
    title VARCHAR(255),
    meeting_date TIMESTAMP,
    venue VARCHAR(255),
    status VARCHAR(20),
    total_contributions DECIMAL(10,2),
    attendance_count INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.title,
        m.meeting_date,
        m.venue,
        m.status,
        COALESCE(SUM(mc.amount), 0) AS total_contributions,
        COUNT(DISTINCT ma.id) AS attendance_count
    FROM public.meetings m
    LEFT JOIN public.meeting_contributions mc ON mc.meeting_id = m.id
    LEFT JOIN public.meeting_attendance ma ON ma.meeting_id = m.id
    WHERE m.org_id = p_org_id
    GROUP BY m.id
    ORDER BY m.meeting_date DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$;

-- Function: Get single meeting with all details
CREATE OR REPLACE FUNCTION get_meeting_details(p_meeting_id INTEGER)
RETURNS TABLE (
    id INTEGER,
    org_id INTEGER,
    title VARCHAR(255),
    meeting_date TIMESTAMP,
    venue VARCHAR(255),
    agenda TEXT,
    minutes_content TEXT,
    attendees JSONB,
    absent_apologies JSONB,
    action_items JSONB,
    status VARCHAR(20),
    created_by INTEGER,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM public.meetings WHERE id = p_meeting_id;
END;
$$;

-- Function: Get contributions for a meeting
CREATE OR REPLACE FUNCTION get_meeting_contributions(p_meeting_id INTEGER)
RETURNS TABLE (
    id INTEGER,
    member_name VARCHAR(255),
    contribution_type VARCHAR(50),
    amount DECIMAL(10,2),
    payment_method VARCHAR(50),
    transaction_reference VARCHAR(100),
    created_at TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mc.id,
        mc.member_name,
        mc.contribution_type,
        mc.amount,
        mc.payment_method,
        mc.transaction_reference,
        mc.created_at
    FROM public.meeting_contributions mc
    WHERE mc.meeting_id = p_meeting_id
    ORDER BY mc.created_at DESC;
END;
$$;

-- Function: Get attendance for a meeting
CREATE OR REPLACE FUNCTION get_meeting_attendance(p_meeting_id INTEGER)
RETURNS TABLE (
    id INTEGER,
    member_name VARCHAR(255),
    status VARCHAR(20),
    arrival_time TIMESTAMP,
    departure_time TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ma.id,
        ma.member_name,
        ma.status,
        ma.arrival_time,
        ma.departure_time
    FROM public.meeting_attendance ma
    WHERE ma.meeting_id = p_meeting_id
    ORDER BY ma.arrival_time;
END;
$$;

-- Function: Save meeting (insert or update)
CREATE OR REPLACE FUNCTION save_meeting(
    p_id INTEGER,
    p_org_id INTEGER,
    p_title VARCHAR(255),
    p_meeting_date TIMESTAMP,
    p_venue VARCHAR(255),
    p_agenda TEXT,
    p_minutes_content TEXT,
    p_attendees JSONB,
    p_absent_apologies JSONB,
    p_action_items JSONB,
    p_status VARCHAR(20),
    p_created_by INTEGER
)
RETURNS TABLE (meeting_id INTEGER, success BOOLEAN, message TEXT)
LANGUAGE plpgsql
AS $$
DECLARE
    v_meeting_id INTEGER;
BEGIN
    IF p_id IS NULL OR p_id = 0 THEN
        -- Insert new meeting
        INSERT INTO public.meetings (
            org_id, title, meeting_date, venue, agenda, minutes_content,
            attendees, absent_apologies, action_items, status, created_by
        ) VALUES (
            p_org_id, p_title, p_meeting_date, p_venue, p_agenda, p_minutes_content,
            p_attendees, p_absent_apologies, p_action_items, p_status, p_created_by
        )
        RETURNING id INTO v_meeting_id;
        
        RETURN QUERY SELECT v_meeting_id, true, 'Meeting created successfully';
    ELSE
        -- Update existing meeting
        UPDATE public.meetings SET
            title = p_title,
            meeting_date = p_meeting_date,
            venue = p_venue,
            agenda = p_agenda,
            minutes_content = p_minutes_content,
            attendees = p_attendees,
            absent_apologies = p_absent_apologies,
            action_items = p_action_items,
            status = p_status,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = p_id;
        
        RETURN QUERY SELECT p_id, true, 'Meeting updated successfully';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RETURN QUERY SELECT -1, false, 'Error: ' || SQLERRM;
END;
$$;

-- Function: Add contribution
CREATE OR REPLACE FUNCTION add_contribution(
    p_org_id INTEGER,
    p_meeting_id INTEGER,
    p_member_id INTEGER,
    p_member_name VARCHAR(255),
    p_contribution_type VARCHAR(50),
    p_amount DECIMAL(10,2),
    p_payment_method VARCHAR(50),
    p_transaction_reference VARCHAR(100),
    p_notes TEXT,
    p_recorded_by INTEGER
)
RETURNS TABLE (contribution_id INTEGER, success BOOLEAN, message TEXT)
LANGUAGE plpgsql
AS $$
DECLARE
    v_contribution_id INTEGER;
BEGIN
    INSERT INTO public.meeting_contributions (
        org_id, meeting_id, member_id, member_name, contribution_type,
        amount, payment_method, transaction_reference, notes, recorded_by
    ) VALUES (
        p_org_id, p_meeting_id, p_member_id, p_member_name, p_contribution_type,
        p_amount, p_payment_method, p_transaction_reference, p_notes, p_recorded_by
    )
    RETURNING id INTO v_contribution_id;
    
    RETURN QUERY SELECT v_contribution_id, true, 'Contribution recorded successfully';
EXCEPTION
    WHEN OTHERS THEN
        RETURN QUERY SELECT -1, false, 'Error: ' || SQLERRM;
END;
$$;

-- Function: Record attendance
CREATE OR REPLACE FUNCTION record_attendance(
    p_org_id INTEGER,
    p_meeting_id INTEGER,
    p_member_id INTEGER,
    p_member_name VARCHAR(255),
    p_status VARCHAR(20),
    p_arrival_time TIMESTAMP
)
RETURNS TABLE (attendance_id INTEGER, success BOOLEAN, message TEXT)
LANGUAGE plpgsql
AS $$
DECLARE
    v_attendance_id INTEGER;
BEGIN
    INSERT INTO public.meeting_attendance (
        org_id, meeting_id, member_id, member_name, status, arrival_time
    ) VALUES (
        p_org_id, p_meeting_id, p_member_id, p_member_name, p_status, p_arrival_time
    )
    RETURNING id INTO v_attendance_id;
    
    RETURN QUERY SELECT v_attendance_id, true, 'Attendance recorded successfully';
EXCEPTION
    WHEN OTHERS THEN
        RETURN QUERY SELECT -1, false, 'Error: ' || SQLERRM;
END;
$$;

-- ============================================
-- PERMISSIONS (For N8N database user)
-- ============================================
-- GRANT SELECT, INSERT, UPDATE, DELETE ON public.meetings TO n8n_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON public.meeting_contributions TO n8n_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON public.meeting_attendance TO n8n_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON public.meeting_documents TO n8n_user;
-- GRANT USAGE, SELECT ON SEQUENCE public.meetings_id_seq TO n8n_user;
-- GRANT USAGE, SELECT ON SEQUENCE public.meeting_contributions_id_seq TO n8n_user;
-- GRANT USAGE, SELECT ON SEQUENCE public.meeting_attendance_id_seq TO n8n_user;
-- GRANT USAGE, SELECT ON SEQUENCE public.meeting_documents_id_seq TO n8n_user;
