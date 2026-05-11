import dotenv from 'dotenv';
dotenv.config();
console.log('DATABASE_URL from process.env:', process.env.DATABASE_URL);
console.log('DATABASE_URL length:', process.env.DATABASE_URL?.length);
