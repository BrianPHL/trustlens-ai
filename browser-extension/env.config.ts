import { defineEnv } from "envin";
import { z } from "zod";

export default defineEnv({
  clientPrefix: "VITE_",
  client: {
    VITE_WEB_APP_URL: z.string().url().default("http://localhost:3000"),
  },
  env: {
    VITE_WEB_APP_URL:
      import.meta.env.VITE_WEB_APP_URL ?? "http://localhost:3000",
  },
  skip:
    (!!import.meta.env.SKIP_ENV_VALIDATION &&
      ["1", "true"].includes(import.meta.env.SKIP_ENV_VALIDATION)) ||
    import.meta.env.npm_lifecycle_event === "lint",
});
