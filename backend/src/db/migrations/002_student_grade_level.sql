-- Add grade_level to students table
ALTER TABLE students ADD COLUMN IF NOT EXISTS grade_level VARCHAR(10);

-- Add prerequisite and is_advanced fields to classes
ALTER TABLE classes ADD COLUMN IF NOT EXISTS is_advanced BOOLEAN DEFAULT false;
ALTER TABLE classes ADD COLUMN IF NOT EXISTS prerequisite_class_id UUID REFERENCES classes(id);
ALTER TABLE classes ADD COLUMN IF NOT EXISTS enrollment_test_required BOOLEAN DEFAULT false;
ALTER TABLE classes ADD COLUMN IF NOT EXISTS prerequisite_description TEXT;

-- Create enrollment tests table to track which students passed enrollment tests
CREATE TABLE IF NOT EXISTS enrollment_test_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    passed BOOLEAN DEFAULT false,
    test_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    score DECIMAL(5,2),
    notes TEXT,
    UNIQUE(class_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollment_tests_class ON enrollment_test_results(class_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_tests_student ON enrollment_test_results(student_id);
