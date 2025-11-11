const { spawn } = require('child_process');
const path = require('path');

// Запускаем Prisma CLI напрямую из node_modules
const prismaPath = path.join(__dirname, 'node_modules/.bin/prisma');
const schemaPath = path.join(__dirname, '../../prisma/schema.prisma');

console.log('📋 Starting Prisma Client generation...');
console.log('🔧 Prisma binary:', prismaPath);
console.log('📄 Schema path:', schemaPath);

// Перехватываем вызовы pnpm через wrapper
const pnpmWrapperPath = '/tmp/pnpm';

const child = spawn(prismaPath, ['generate', `--schema=${schemaPath}`], {
  stdio: 'inherit',
  env: {
    ...process.env,
    // Убеждаемся что wrapper будет использован вместо оригинального pnpm
    PATH: `/tmp:${process.env.PATH}`,
  },
});

child.on('error', (error) => {
  console.error('❌ Failed to start Prisma:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  if (code === 0) {
    console.log('✅ Prisma Client generated successfully!');
  } else {
    console.error(`❌ Prisma generation failed with exit code ${code}`);
    process.exit(code);
  }
});
