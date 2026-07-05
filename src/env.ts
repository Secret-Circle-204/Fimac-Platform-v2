import process from "node:process"
import { z } from "zod"

const EnvSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  NEXT_PUBLIC_SITE_URL: z.string().url("NEXT_PUBLIC_SITE_URL must be a valid URL").optional(),
  NEXT_PUBLIC_SERVER_URL: z.string().url("NEXT_PUBLIC_SERVER_URL must be a valid URL").optional(),
  PAYLOAD_SECRET: z.string().min(32, "PAYLOAD_SECRET must be at least 32 characters"),
  ADMIN_NOTIFICATIONS_EMAIL: z.string().email("ADMIN_NOTIFICATIONS_EMAIL must be a valid email"),
  FROM_EMAIL: z.string().email("FROM_EMAIL must be a valid email").optional(),
  SMTP_HOST: z.string().min(1, "SMTP_HOST is required"),
  SMTP_PORT: z
    .string()
    .regex(/^\d+$/, "SMTP_PORT must be a valid number")
    .transform((value: string) => Number(value)),
  SMTP_SECURE: z.string().optional(),
  SMTP_USER: z.string().min(1, "SMTP_USER is required"),
  SMTP_PASSWORD: z.string().min(1, "SMTP_PASSWORD is required"),
  AUTH_COOKIE_DOMAIN: z.string().optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  GOOGLE_MAPS_API_KEY: z.string().optional(),
})

const parsedEnv = EnvSchema.safeParse(process.env)

if (!parsedEnv.success) {
  const formattedError = parsedEnv.error.issues
    .map((err) => `${err.path.join(".") || "unknown"}: ${err.message}`)
    .join("\n")

  throw new Error(`Invalid environment configuration:\n${formattedError}`)
}

const env = parsedEnv.data

const resolvedServerUrl = env.NEXT_PUBLIC_SITE_URL || env.NEXT_PUBLIC_SERVER_URL

if (!resolvedServerUrl) {
  throw new Error("Either NEXT_PUBLIC_SITE_URL or NEXT_PUBLIC_SERVER_URL must be provided")
}

const normalizeUrl = (value: string) => value.replace(/\/$/, "")

export const DATABASE_URL = env.DATABASE_URL
export const SERVER_URL = normalizeUrl(resolvedServerUrl)
export const PAYLOAD_SECRET = env.PAYLOAD_SECRET
export const NODE_ENV = env.NODE_ENV
export const GOOGLE_MAPS_API_KEY = env.GOOGLE_MAPS_API_KEY
export const ADMIN_NOTIFICATIONS_EMAIL = env.ADMIN_NOTIFICATIONS_EMAIL
export const AUTH_COOKIE_DOMAIN = env.AUTH_COOKIE_DOMAIN
export const EMAIL_FROM = env.FROM_EMAIL || env.SMTP_USER
export const SMTP_SETTINGS = {
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE?.toLowerCase() === "true",
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASSWORD,
  },
}
