import { z } from "zod";

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional().default("http://localhost:3000"),
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().regex(/^G-[A-Z0-9]+$/).optional(),
});

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20).optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

function formatErrors(errors: z.ZodError): string {
  const fieldErrors = errors.flatten().fieldErrors;
  return Object.entries(fieldErrors)
    .map(([field, messages]) => {
      const msgs = messages as string[] | undefined;
      return `  • ${field}: ${(msgs ?? []).join(", ")}`;
    })
    .join("\n");
}

const clientParsed = clientSchema.safeParse(process.env);
if (!clientParsed.success) {
  console.error(
    "\n❌ Environment variables tidak valid:\n" +
      formatErrors(clientParsed.error)
  );
  throw new Error("Environment variables tidak lengkap.");
}

const serverParsed =
  typeof window === "undefined" ? serverSchema.safeParse(process.env) : null;
if (serverParsed && !serverParsed.success) {
  console.error(
    "\n❌ Server environment variables tidak valid:\n" +
      formatErrors(serverParsed.error)
  );
  throw new Error("Server environment variables tidak lengkap.");
}

export const env = {
  ...clientParsed.data,
  ...(serverParsed?.data ?? {}),
} as z.infer<typeof clientSchema> & Partial<z.infer<typeof serverSchema>>;
