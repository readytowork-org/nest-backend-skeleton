#!/bin/bash

# Prompt the user for the target folder
read -p "Enter the schema name [no space]: " schema_name

echo "schema name: $schema_name"

cat <<EOF > "src/db/schemas/$schema_name.schema.ts"
import { int, mysqlTable } from 'drizzle-orm/mysql-core';
import { timestamps } from '@app/common';

export const $schema_name = mysqlTable('$schema_name', {
    id: int().autoincrement().primaryKey(),
    ...timestamps,
});
EOF
echo "schema created"
