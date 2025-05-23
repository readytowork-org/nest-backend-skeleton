# Path Aliases Guide

This document explains the path aliases used in our NestJS application to make imports cleaner and more maintainable.

## Available Path Aliases

We've configured the following path aliases in `tsconfig.json`:

| Alias        | Points to       | Use for                  |
| ------------ | --------------- | ------------------------ |
| `@app/*`     | `src/*`         | Root application imports |
| `@modules/*` | `src/modules/*` | Feature modules          |
| `@common/*`  | `src/common/*`  | Common/shared utilities  |
| `@core/*`    | `src/core/*`    | Core functionality       |
| `@config/*`  | `src/config/*`  | Configuration            |

## Benefits

Using path aliases provides several advantages:

1. **Cleaner imports**: No more lengthy relative paths with multiple `../../../`
2. **Easier refactoring**: Moving files doesn't break import paths
3. **Better readability**: Path aliases make it clear which part of the application a module belongs to
4. **Improved maintainability**: Path aliases make the codebase more consistent

## Examples

### Before:

```typescript
// Deep imports with relative paths
import { PrismaService } from '../../../core/database/prisma/prisma.service';
import { AppLogger } from '../../../common/logger/app-logger.service';
import { AuthUser } from '../auth/interfaces/user.interface';
```

### After:

```typescript
// Clean imports with path aliases
import { PrismaService } from '@core/database/prisma/prisma.service';
import { AppLogger } from '@common/logger/app-logger.service';
import { AuthUser } from '@modules/auth/interfaces/user.interface';
```

## Implementation Details

Path aliases are configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    // ... other options
    "paths": {
      "@app/*": ["src/*"],
      "@modules/*": ["src/modules/*"],
      "@common/*": ["src/common/*"],
      "@core/*": ["src/core/*"],
      "@config/*": ["src/config/*"]
    }
  }
}
```

The `tsconfig-paths` package is used to resolve these aliases at runtime.
