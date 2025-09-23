import fs from 'fs';
import path from 'path';
import swaggerJsdoc from 'swagger-jsdoc';
import { swaggerOptions } from '../lib/swagger';

async function main() {
  const spec = swaggerJsdoc(swaggerOptions);
  const publicDir = path.resolve(process.cwd(), 'public');
  const outPath = path.join(publicDir, 'swagger.json');

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(outPath, JSON.stringify(spec, null, 2), 'utf-8');
  // eslint-disable-next-line no-console
  console.log(`Swagger spec written to ${outPath}`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to generate swagger spec', err);
  process.exit(1);
});


