interface EnvConfig {
  port: number;
  omdbApiKey: string;
  omdbPageSize: number;
  corsOrigin: string[];
  nodeEnv: string;
}

function validateEnv(): EnvConfig {
  const requiredEnvVars = ["OMDB_API_KEY", "CORS_ORIGIN"];
  const missingVars: string[] = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  }

  if (missingVars.length > 0) {
    console.error("❌ Missing required environment variables:");
    missingVars.forEach((varName) => {
      console.error(`   - ${varName}`);
    });
    console.error(
      "\nPlease set these environment variables and restart the application.",
    );
    process.exit(1);
  }

  // Validate CORS_ORIGIN format
  const corsOrigins = process.env
    .CORS_ORIGIN!.split(",")
    .map((origin) => origin.trim());
  if (corsOrigins.length === 0 || corsOrigins.some((origin) => !origin)) {
    console.error("❌ CORS_ORIGIN must contain at least one valid origin");
    process.exit(1);
  }

  return {
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3001,
    omdbApiKey: process.env.OMDB_API_KEY!,
    omdbPageSize: process.env.OMDB_PAGE_SIZE
      ? parseInt(process.env.OMDB_PAGE_SIZE, 10)
      : 10,
    corsOrigin: corsOrigins,
    nodeEnv: process.env.NODE_ENV || "development",
  };
}

let env: EnvConfig | undefined;

export const getEnvConfig = (): EnvConfig => {
  if (!env) {
    env = validateEnv();
  }
  return env;
};
