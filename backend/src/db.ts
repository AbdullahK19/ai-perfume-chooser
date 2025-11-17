import { PrismaClient } from './generated/prisma/client';

/**
 * Prisma Client Singleton
 *
 * This creates a single instance of PrismaClient that we'll import
 * throughout our application. Why singleton?
 *
 * 1. Connection pooling: PrismaClient manages database connections.
 *    Multiple instances = too many connections to PostgreSQL.
 *
 * 2. Performance: Creating a new PrismaClient is expensive.
 *
 * 3. Best practice: Prisma recommends one instance per application.
 */

// Create the Prisma Client instance
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'], // Log all database operations (helpful for learning!)
});

// Export it so other files can import it
export default prisma;

/**
 * USAGE EXAMPLE in other files:
 *
 * import prisma from './db';
 *
 * const users = await prisma.user.findMany();
 * const newUser = await prisma.user.create({
 *   data: { emailHash: '...', phoneHash: '...' }
 * });
 */