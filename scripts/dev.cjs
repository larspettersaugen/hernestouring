#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const schemaPath = path.join(projectRoot, 'prisma/schema.prisma');
const nextDir = path.join(projectRoot, '.next');
const nextServerDir = path.join(nextDir, 'server');

process.chdir(projectRoot);

execSync('npx prisma generate', { stdio: 'inherit' });

const schemaExists = fs.existsSync(schemaPath);
const nextExists = fs.existsSync(nextDir);
const nextServerExists = fs.existsSync(nextServerDir);

let clearNext = !nextExists || !nextServerExists;
if (!clearNext && schemaExists) {
  clearNext = fs.statSync(schemaPath).mtimeMs > fs.statSync(nextServerDir).mtimeMs;
}

if (clearNext) {
  fs.rmSync(nextDir, { recursive: true, force: true });
}

execSync('npx next dev -p 3000', { stdio: 'inherit' });
