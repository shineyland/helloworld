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
        INSERT INTO students (user_id, student_id, enrollment_date, graduation_year)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id) DO NOTHING
      `, [studentResult.rows[0].id, 'STU001', new Date(), 2026]);
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
      ['English', 'ENG101', 'English Language and Literature', 3],
      ['Science', 'SCI101', 'General Science', 3],
      ['History', 'HIST101', 'World History', 2]
    ];

    for (const [name, code, description, credits] of subjects) {
      await client.query(`
        INSERT INTO subjects (name, code, description, credits)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (code) DO NOTHING
      `, [name, code, description, credits]);
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
