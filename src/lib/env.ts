/**
 * Environment variable validation
 * Validates all required environment variables at startup
 */

const requiredEnvVars = [
  "DATABASE_URL",
  "NEXTAUTH_URL",
  "NEXTAUTH_SECRET",
  "ENCRYPTION_KEY",
] as const;

const optionalEnvVars = [
  "REDIS_URL",
  "DATABASE_READ_REPLICA_URL",
  "OPENAI_API_KEY",
  "GEMINI_API_KEY",
  "GOOGLE_GEMINI_API_KEY",
  "NEXT_PUBLIC_SENTRY_DSN",
  "SENTRY_DSN",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "RESEND_API_KEY",
  "SENDGRID_API_KEY",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "AWS_S3_BUCKET",
  "AWS_REGION",
] as const;

interface EnvConfig {
  database: {
    url: string;
    readReplicaUrl?: string;
  };
  auth: {
    url: string;
    secret: string;
  };
  encryption: {
    key: string;
  };
  redis: {
    url: string;
  };
  ai: {
    openaiKey?: string;
  };
  monitoring: {
    sentryDsn?: string;
    sentryPublicDsn?: string;
  };
  payment: {
    razorpayKeyId?: string;
    razorpayKeySecret?: string;
  };
  email: {
    resendApiKey?: string;
    sendgridApiKey?: string;
  };
  storage: {
    awsAccessKeyId?: string;
    awsSecretAccessKey?: string;
    awsS3Bucket?: string;
    awsRegion?: string;
  };
}

function validateEnvVar(name: string, required: boolean = true): string | undefined {
  const value = process.env[name];
  if (required && !value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function validateEncryptionKey(): void {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error("ENCRYPTION_KEY is required");
  }
  // Encryption key should be 32 bytes (base64 encoded = 44 characters)
  const decoded = Buffer.from(key, "base64");
  if (decoded.length !== 32) {
    throw new Error("ENCRYPTION_KEY must be a 32-byte key encoded in base64");
  }
}

export function validateEnv(): EnvConfig {
  // Validate required variables
  requiredEnvVars.forEach((varName) => {
    validateEnvVar(varName, true);
  });

  // Validate encryption key format
  validateEncryptionKey();

  // Build config object
  const config: EnvConfig = {
    database: {
      url: process.env.DATABASE_URL!,
      readReplicaUrl: process.env.DATABASE_READ_REPLICA_URL,
    },
    auth: {
      url: process.env.NEXTAUTH_URL!,
      secret: process.env.NEXTAUTH_SECRET!,
    },
    encryption: {
      key: process.env.ENCRYPTION_KEY!,
    },
    redis: {
      url: process.env.REDIS_URL || "redis://localhost:6379",
    },
    ai: {
      openaiKey: process.env.OPENAI_API_KEY,
    },
    monitoring: {
      sentryDsn: process.env.SENTRY_DSN,
      sentryPublicDsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    },
    payment: {
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET,
    },
    email: {
      resendApiKey: process.env.RESEND_API_KEY,
      sendgridApiKey: process.env.SENDGRID_API_KEY,
    },
    storage: {
      awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
      awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      awsS3Bucket: process.env.AWS_S3_BUCKET,
      awsRegion: process.env.AWS_REGION,
    },
  };

  return config;
}

// Validate on module load (only in server-side code)
if (typeof window === "undefined") {
  try {
    validateEnv();
  } catch (error) {
    console.error("Environment validation failed:", error);
    // In development, warn but don't crash
    if (process.env.NODE_ENV === "production") {
      throw error;
    }
  }
}

export const env = validateEnv();

