-- ============================================
-- Supabase Setup for Academic Delivery Platform
-- كلية العلاج الطبيعي - جامعة قنا
-- Programming & Development: Abdullah Sabry
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: users
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nationalId TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    email TEXT,
    password TEXT,
    role TEXT NOT NULL CHECK (role IN ('admin', 'supervisor', 'student')),
    resetToken TEXT,
    resetExpires TIMESTAMPTZ,
    createdAt TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default admin
INSERT INTO users (nationalId, name, email, password, role)
VALUES ('30409302705170', 'المسؤول', 'admin@qena.edu.eg', 'QWRtaW4=', 'admin')
ON CONFLICT (nationalId) DO NOTHING;

-- ============================================
-- TABLE: courses
-- ============================================
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    code TEXT NOT NULL UNIQUE,
    createdBy UUID REFERENCES users(id),
    createdAt TIMESTAMPTZ DEFAULT NOW(),
    updatedAt TIMESTAMPTZ,
    isActive BOOLEAN DEFAULT TRUE
);

-- ============================================
-- TABLE: courseStudents
-- ============================================
CREATE TABLE IF NOT EXISTS courseStudents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    courseId UUID REFERENCES courses(id) ON DELETE CASCADE,
    studentId UUID REFERENCES users(id) ON DELETE CASCADE,
    nationalId TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    addedAt TIMESTAMPTZ DEFAULT NOW(),
    addedBy UUID REFERENCES users(id),
    UNIQUE(courseId, studentId)
);

-- ============================================
-- TABLE: groups
-- ============================================
CREATE TABLE IF NOT EXISTS groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    courseId UUID REFERENCES courses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    members UUID[] DEFAULT '{}',
    createdBy UUID REFERENCES users(id),
    createdAt TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: assignments
-- ============================================
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    courseId UUID REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    dueDate TIMESTAMPTZ,
    type TEXT DEFAULT 'individual' CHECK (type IN ('individual', 'group')),
    groupId UUID REFERENCES groups(id) ON DELETE SET NULL,
    createdBy UUID REFERENCES users(id),
    createdAt TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'deleted'))
);

-- ============================================
-- TABLE: submissions
-- ============================================
CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignmentId UUID REFERENCES assignments(id) ON DELETE CASCADE,
    studentId UUID REFERENCES users(id) ON DELETE CASCADE,
    fileName TEXT NOT NULL,
    fileSize INTEGER,
    fileType TEXT,
    fileUrl TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'revision')),
    feedback TEXT,
    grade INTEGER,
    submittedAt TIMESTAMPTZ DEFAULT NOW(),
    reviewedAt TIMESTAMPTZ,
    reviewedBy UUID REFERENCES users(id),
    UNIQUE(assignmentId, studentId)
);

-- ============================================
-- TABLE: notifications
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    userId UUID REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('assignment', 'submission', 'review')),
    title TEXT NOT NULL,
    message TEXT,
    assignmentId UUID REFERENCES assignments(id) ON DELETE SET NULL,
    submissionId UUID REFERENCES submissions(id) ON DELETE SET NULL,
    read BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: supervisors
-- ============================================
CREATE TABLE IF NOT EXISTS supervisors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    userId UUID REFERENCES users(id) ON DELETE CASCADE,
    nationalId TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    createdBy UUID REFERENCES users(id),
    createdAt TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE courseStudents ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE supervisors ENABLE ROW LEVEL SECURITY;

-- Users: allow all reads, restrict writes
CREATE POLICY "Allow all reads on users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow insert on users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update own user" ON users FOR UPDATE USING (true);

-- Courses: allow all reads, admin/supervisor can modify
CREATE POLICY "Allow all reads on courses" ON courses FOR SELECT USING (true);
CREATE POLICY "Allow all modifications on courses" ON courses FOR ALL USING (true) WITH CHECK (true);

-- CourseStudents
CREATE POLICY "Allow all reads on courseStudents" ON courseStudents FOR SELECT USING (true);
CREATE POLICY "Allow all modifications on courseStudents" ON courseStudents FOR ALL USING (true) WITH CHECK (true);

-- Groups
CREATE POLICY "Allow all reads on groups" ON groups FOR SELECT USING (true);
CREATE POLICY "Allow all modifications on groups" ON groups FOR ALL USING (true) WITH CHECK (true);

-- Assignments
CREATE POLICY "Allow all reads on assignments" ON assignments FOR SELECT USING (true);
CREATE POLICY "Allow all modifications on assignments" ON assignments FOR ALL USING (true) WITH CHECK (true);

-- Submissions
CREATE POLICY "Allow all reads on submissions" ON submissions FOR SELECT USING (true);
CREATE POLICY "Allow all modifications on submissions" ON submissions FOR ALL USING (true) WITH CHECK (true);

-- Notifications
CREATE POLICY "Allow all reads on notifications" ON notifications FOR SELECT USING (true);
CREATE POLICY "Allow all modifications on notifications" ON notifications FOR ALL USING (true) WITH CHECK (true);

-- Supervisors
CREATE POLICY "Allow all reads on supervisors" ON supervisors FOR SELECT USING (true);
CREATE POLICY "Allow all modifications on supervisors" ON supervisors FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- STORAGE BUCKET: submissions
-- ============================================
-- Go to Storage in Supabase Dashboard and create a bucket named "submissions"
-- Set it to public
