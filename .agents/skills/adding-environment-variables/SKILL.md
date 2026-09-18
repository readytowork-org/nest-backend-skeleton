---
name: adding-environment-variables
description: Adds a new environment variable to this NestJS skeleton's config, keeping .env.example and the validated EnvironmentVariables class in sync. Use when a change needs a new config value, secret, or feature flag read from the environment.
---

# Adding an environment variable

Every environment variable in this project must be added in two places or
it is silently unvalidated at startup.

## Steps

1. Add the variable to `.env.example` with a placeholder value, grouped
   near related variables (for example alongside the JWT block for an auth
   setting, or the mail block for an email setting).

2. Add a decorated property to `EnvironmentVariables` in
   `src/config/env/env.validation.ts`, using `class-validator` decorators:

   ```ts
   @IsString()
   @IsNotEmpty()
   MY_NEW_SETTING: string;
   ```

   Use `@IsOptional()` if the app should run without it. This class is
   validated synchronously against `.env` at import time
   (`dotenv.parse` + `validateSync`); a missing required var throws at
   startup with a clear error listing every failing field.

3. If local development needs a real value, add it to your own `.env`
   (not committed).

4. Use the value via the exported `envVars` singleton:

   ```ts
   import { envVars } from '@app/config/env/env.validation';
   envVars.MY_NEW_SETTING;
   ```

   Do not use NestJS's injected `ConfigService.get(...)` for this. Even
   though `ConfigModule.forRoot({ isGlobal: true })` is registered in
   `app.module.ts`, this codebase consistently reads config through
   `envVars`, not the injected service. The separate `config-loader`
   (`src/config/config-loader/index.ts`) is only for `drizzle.config.ts`,
   which runs outside the Nest runtime as a plain CLI script; do not use it
   from application code.

5. Run the verifying-changes-before-commit skill before treating the
   change as done.
