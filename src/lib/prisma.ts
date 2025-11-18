import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaRead: PrismaClient | undefined;
};

// Write database (primary) - for mutations
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  }).$extends({
    query: {
      $allOperations({ operation, model, args, query }) {
        // Add query timeout for all operations
        const start = Date.now();
        return query(args).finally(() => {
          const duration = Date.now() - start;
          if (duration > 5000) {
            console.warn(`Slow query: ${model}.${operation} took ${duration}ms`);
          }
        });
      },
    },
  });

// Read replica - for read-heavy operations
export const prismaRead =
  globalForPrisma.prismaRead ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_READ_REPLICA_URL || process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaRead = prismaRead;
}

// Helper function to choose read or write database
export function getPrismaClient(operation: "read" | "write" = "write") {
  return operation === "read" ? prismaRead : prisma;
}

