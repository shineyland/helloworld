import 'dotenv/config';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'school_management',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD
});

const seedData = async () => {
  const client = await pool.connect();

  try {
    console.log('Starting seed...');

    // Create default admin user
    const adminPassword = await bcrypt.hash('admin123', 10);

    await client.query(`
      INSERT INTO users (email, password_hash, role, first_name, last_name)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO NOTHING
    `, ['admin@school.com', adminPassword, 'admin', 'System', 'Administrator']);

    // Get admin user id
    const adminResult = await client.query(
      `SELECT id FROM users WHERE email = 'admin@school.com'`
    );

    if (adminResult.rows.length > 0) {
      await client.query(`
        INSERT INTO administrators (user_id, department)
        VALUES ($1, $2)
        ON CONFLICT (user_id) DO NOTHING
      `, [adminResult.rows[0].id, 'Administration']);
    }

    // Create sample teacher
    const teacherPassword = await bcrypt.hash('teacher123', 10);

    await client.query(`
      INSERT INTO users (email, password_hash, role, first_name, last_name)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO NOTHING
    `, ['teacher@school.com', teacherPassword, 'teacher', 'John', 'Smith']);

    const teacherResult = await client.query(
      `SELECT id FROM users WHERE email = 'teacher@school.com'`
    );

    if (teacherResult.rows.length > 0) {
      await client.query(`
        INSERT INTO teachers (user_id, employee_id, department, specialization)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id) DO NOTHING
      `, [teacherResult.rows[0].id, 'TCH001', 'Mathematics', 'Algebra']);
    }

    // Create sample student
    const studentPassword = await bcrypt.hash('student123', 10);

    await client.query(`
      INSERT INTO users (email, password_hash, role, first_name, last_name)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO NOTHING
    `, ['student@school.com', studentPassword, 'student', 'Jane', 'Doe']);

    const studentResult = await client.query(
      `SELECT id FROM users WHERE email = 'student@school.com'`
    );

    if (studentResult.rows.length > 0) {
      await client.query(`
        INSERT INTO students (user_id, student_id, enrollment_date, graduation_year, grade_level, date_of_birth)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (user_id) DO UPDATE SET grade_level = $5, date_of_birth = $6
      `, [studentResult.rows[0].id, 'STU001', new Date(), 2026, '10', '2010-05-15']);
    }

    // Create current academic year
    await client.query(`
      INSERT INTO academic_years (name, start_date, end_date, is_current)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT DO NOTHING
    `, ['2025-2026', '2025-09-01', '2026-06-30', true]);

    // Create sample subjects
    const subjects = [
      ['Mathematics', 'MATH101', 'Introduction to Mathematics', 3],
      ['Advanced Mathematics', 'MATH201', 'Calculus and Linear Algebra', 4],
      ['English', 'ENG101', 'English Language and Literature', 3],
      ['Creative Writing', 'ENG201', 'Fiction and Poetry Writing', 2],
      ['Science', 'SCI101', 'General Science', 3],
      ['Physics', 'PHY101', 'Introduction to Physics', 4],
      ['Chemistry', 'CHEM101', 'General Chemistry', 4],
      ['Biology', 'BIO101', 'Introduction to Biology', 3],
      ['History', 'HIST101', 'World History', 2],
      ['Computer Science', 'CS101', 'Introduction to Programming', 3],
      ['Art', 'ART101', 'Visual Arts Fundamentals', 2],
      ['Music', 'MUS101', 'Music Theory and Appreciation', 2],
      ['Physical Education', 'PE101', 'Health and Fitness', 1]
    ];

    for (const [name, code, description, credits] of subjects) {
      await client.query(`
        INSERT INTO subjects (name, code, description, credits)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (code) DO NOTHING
      `, [name, code, description, credits]);
    }

    // Get subject IDs
    const subjectResults = await client.query(`SELECT id, code FROM subjects`);
    const subjectMap = {};
    for (const row of subjectResults.rows) {
      subjectMap[row.code] = row.id;
    }

    // Get teacher ID
    const teacherIdResult = await client.query(
      `SELECT id FROM teachers WHERE employee_id = 'TCH001'`
    );
    const teacherId = teacherIdResult.rows[0]?.id;

    // Get academic year
    const yearResult = await client.query(
      `SELECT id FROM academic_years WHERE is_current = true LIMIT 1`
    );
    const academicYearId = yearResult.rows[0]?.id;

    // Create sample classes
    // Format: [name, subjectCode, gradeLevel, section, roomNumber, schedule, maxStudents, isAdvanced, enrollmentTestRequired, prerequisiteDescription]
    const classes = [
      ['Algebra I', 'MATH101', '9', 'A', '101', { days: 'Mon, Wed, Fri', time: '9:00 AM' }, 30, false, false, null],
      ['Algebra I', 'MATH101', '9', 'B', '101', { days: 'Mon, Wed, Fri', time: '10:00 AM' }, 30, false, false, null],
      ['Algebra II', 'MATH101', '10', 'A', '102', { days: 'Mon, Wed, Fri', time: '10:00 AM' }, 25, false, false, null],
      ['Algebra II', 'MATH101', '10', 'B', '102', { days: 'Tue, Thu', time: '9:00 AM' }, 25, false, false, null],
      ['Pre-Calculus', 'MATH201', '11', 'A', '103', { days: 'Mon, Wed, Fri', time: '9:00 AM' }, 22, false, false, null],
      ['AP Calculus', 'MATH201', '11', 'A', '103', { days: 'Tue, Thu', time: '9:00 AM' }, 20, true, true, 'Requires passing the AP Calculus placement test and completion of Pre-Calculus'],
      ['AP Calculus', 'MATH201', '12', 'A', '103', { days: 'Mon, Wed, Fri', time: '8:00 AM' }, 20, true, true, 'Requires passing the AP Calculus placement test'],
      ['English 9', 'ENG101', '9', 'A', '201', { days: 'Mon, Wed, Fri', time: '11:00 AM' }, 30, false, false, null],
      ['English 10', 'ENG101', '10', 'A', '201', { days: 'Tue, Thu', time: '11:00 AM' }, 30, false, false, null],
      ['English 11', 'ENG101', '11', 'A', '202', { days: 'Mon, Wed, Fri', time: '10:00 AM' }, 28, false, false, null],
      ['AP English Literature', 'ENG201', '11', 'A', '202', { days: 'Tue, Thu', time: '2:00 PM' }, 15, true, true, 'Requires passing the AP English placement test'],
      ['AP English Literature', 'ENG201', '12', 'A', '202', { days: 'Mon, Wed', time: '2:00 PM' }, 15, true, true, 'Requires passing the AP English placement test'],
      ['General Science', 'SCI101', '9', 'A', '301', { days: 'Mon, Wed', time: '1:00 PM' }, 28, false, false, null],
      ['General Science', 'SCI101', '9', 'B', '301', { days: 'Tue, Thu', time: '1:00 PM' }, 28, false, false, null],
      ['Biology', 'BIO101', '10', 'A', '304', { days: 'Tue, Thu', time: '11:00 AM' }, 26, false, false, null],
      ['Biology', 'BIO101', '10', 'B', '304', { days: 'Mon, Wed', time: '11:00 AM' }, 26, false, false, null],
      ['AP Biology', 'BIO101', '11', 'A', '304', { days: 'Mon, Wed, Fri', time: '9:00 AM' }, 20, true, true, 'Requires passing the AP Biology entrance exam'],
      ['Chemistry', 'CHEM101', '10', 'A', '303', { days: 'Mon, Wed, Fri', time: '2:00 PM' }, 24, false, false, null],
      ['Chemistry', 'CHEM101', '11', 'A', '303', { days: 'Tue, Thu', time: '2:00 PM' }, 24, false, false, null],
      ['AP Chemistry', 'CHEM101', '11', 'A', '303', { days: 'Mon, Wed, Fri', time: '1:00 PM' }, 18, true, true, 'Requires passing the AP Chemistry placement test'],
      ['Physics', 'PHY101', '11', 'A', '302', { days: 'Tue, Thu', time: '10:00 AM' }, 25, false, false, null],
      ['AP Physics', 'PHY101', '12', 'A', '302', { days: 'Mon, Wed, Fri', time: '10:00 AM' }, 18, true, true, 'Requires passing the AP Physics entrance exam and completion of Algebra II'],
      ['World History', 'HIST101', '9', 'A', '401', { days: 'Mon, Wed', time: '10:00 AM' }, 30, false, false, null],
      ['World History', 'HIST101', '9', 'B', '401', { days: 'Tue, Thu', time: '10:00 AM' }, 30, false, false, null],
      ['US History', 'HIST101', '10', 'A', '401', { days: 'Mon, Wed, Fri', time: '11:00 AM' }, 30, false, false, null],
      ['Intro to Programming', 'CS101', '10', 'A', '501', { days: 'Tue, Thu', time: '1:00 PM' }, 20, false, false, null],
      ['Intro to Programming', 'CS101', '10', 'B', '501', { days: 'Mon, Wed', time: '1:00 PM' }, 20, false, false, null],
      ['AP Computer Science', 'CS101', '11', 'A', '501', { days: 'Mon, Wed, Fri', time: '2:00 PM' }, 18, true, true, 'Requires passing the AP CS placement test and completion of Intro to Programming'],
      ['Art Studio', 'ART101', '9', 'A', '601', { days: 'Fri', time: '1:00 PM' }, 18, false, false, null],
      ['Art Studio', 'ART101', '10', 'A', '601', { days: 'Fri', time: '2:00 PM' }, 18, false, false, null],
      ['Music Basics', 'MUS101', '9', 'A', '602', { days: 'Wed', time: '2:00 PM' }, 20, false, false, null],
      ['Music Basics', 'MUS101', '10', 'A', '602', { days: 'Thu', time: '2:00 PM' }, 20, false, false, null],
      ['Physical Education', 'PE101', '9', 'A', 'GYM', { days: 'Mon, Wed, Fri', time: '8:00 AM' }, 35, false, false, null],
      ['Physical Education', 'PE101', '10', 'A', 'GYM', { days: 'Tue, Thu', time: '8:00 AM' }, 35, false, false, null],
      ['Physical Education', 'PE101', '11', 'A', 'GYM', { days: 'Mon, Wed', time: '8:00 AM' }, 35, false, false, null]
    ];

    for (const [name, subjectCode, gradeLevel, section, roomNumber, schedule, maxStudents, isAdvanced, enrollmentTestRequired, prerequisiteDescription] of classes) {
      const subjectId = subjectMap[subjectCode];

      const classResult = await client.query(`
        INSERT INTO classes (name, subject_id, academic_year_id, grade_level, section, room_number, schedule, max_students, is_advanced, enrollment_test_required, prerequisite_description)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT DO NOTHING
        RETURNING id
      `, [name, subjectId, academicYearId, gradeLevel, section, roomNumber, JSON.stringify(schedule), maxStudents, isAdvanced, enrollmentTestRequired, prerequisiteDescription]);

      // Assign teacher to class
      if (classResult.rows.length > 0 && teacherId) {
        await client.query(`
          INSERT INTO class_teachers (class_id, teacher_id, is_primary)
          VALUES ($1, $2, true)
          ON CONFLICT DO NOTHING
        `, [classResult.rows[0].id, teacherId]);
      }
    }

    console.log('Seed completed successfully!');
    console.log('\nDefault credentials:');
    console.log('Admin:   admin@school.com / admin123');
    console.log('Teacher: teacher@school.com / teacher123');
    console.log('Student: student@school.com / student123');

  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

seedData();
