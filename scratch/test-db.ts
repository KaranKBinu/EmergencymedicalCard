import * as dotenv from 'dotenv';
dotenv.config();
import { prisma } from '../src/lib/prisma';

async function test() {
  try {
    console.log('Testing connection...');
    const users = await prisma.user.findMany();
    console.log('Users count:', users.length);
    console.log('Connection successful!');
  } catch (error) {
    console.error('Connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
