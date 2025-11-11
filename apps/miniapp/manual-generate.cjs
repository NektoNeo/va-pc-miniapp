const { getGenerators } = require('@prisma/internals');
const path = require('path');

const schemaPath = path.resolve(__dirname, '../../prisma/schema.prisma');

console.log('📋 Reading schema from:', schemaPath);
console.log('⚙️  Generating Prisma Client...');

(async () => {
  try {
    const generators = await getGenerators({
      schemaPath,
      dataProxy: false,
    });

    console.log(`✅ Found ${generators.length} generators`);

    for (const generator of generators) {
      const name = generator.options?.generator?.name || 'client';
      console.log(`🔨 Generating ${name}...`);
      await generator.generate();
      console.log(`✅ Generated ${name}`);
      generator.stop();
    }

    console.log('✅ Prisma Client generation completed!');
  } catch (error) {
    console.error('❌ Generation failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
})();
