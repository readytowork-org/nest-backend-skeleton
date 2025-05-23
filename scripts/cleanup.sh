#!/bin/bash

# Cleanup script for the NestJS Todo app
# This script removes redundant files and directories after the reorganization

echo "Starting cleanup..."

# Remove redundant files from old directories
echo "Removing old files..."

# Remove auth module files (now in modules/auth)
rm -f src/auth/auth.controller.ts
rm -f src/auth/auth.module.ts
rm -f src/auth/auth.service.ts
rm -f src/auth/decorators/current-user.decorator.ts
rm -f src/auth/dto/auth.dto.ts
rm -f src/auth/guards/google-auth.guard.ts
rm -f src/auth/guards/jwt-auth.guard.ts
rm -f src/auth/interfaces/user.interface.ts
rm -f src/auth/strategies/google.strategy.ts
rm -f src/auth/strategies/jwt.strategy.ts

# Remove todos module files (now in modules/todos)
rm -f src/todos/todos.controller.ts
rm -f src/todos/todos.module.ts
rm -f src/todos/todos.service.ts
rm -f src/todos/dto/todo.dto.ts
rm -f src/todos/repositories/todo.repository.ts

# Remove prisma module files (now in core/database/prisma)
rm -f src/prisma/prisma.module.ts
rm -f src/prisma/prisma.service.ts

# Remove empty directories (if any)
echo "Removing empty directories..."
find src -type d -empty -delete

echo "Cleanup completed!" 