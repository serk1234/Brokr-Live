import dotenv from 'dotenv';
import postgres from 'postgres';

dotenv.config(); // Explicitly load .env file

console.log('DATABASE_URL:', process.env.DATABASE_URL); // Debugging step

const connectionString = process.env.DATABASE_URL;
const sql = postgres(connectionString);

const testConnection = async () => {
  try {
    const result = await sql`SELECT NOW() AS current_time;`;
    console.log('Database connection successful:', result);
  } catch (error) {
    console.error('Error connecting to database:', error.message);
  } finally {
    await sql.end();
  }
};

testConnection();
