// lib/db.ts - singleton to avoid exhausting connections on dev hot-reloads
import { PrismaClient } from '@prisma/client';

// Monkey-patch BigInt to support JSON serialization.
// WHY this is here:
//   JavaScript's JSON.stringify does not support BigInt serialization by default.
//   Since our schema stores monetary values (paise) in BigInt, Next.js route
//   handlers would crash with a TypeError when trying to return database records.
//   Defining toJSON on the prototype resolves this globally for all endpoints.
if (typeof (BigInt.prototype as any).toJSON === 'undefined') {
  (BigInt.prototype as any).toJSON = function (this: bigint) {
    return this.toString();
  };
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ log: process.env.NODE_ENV === 'development' ? ['query'] : [] });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
