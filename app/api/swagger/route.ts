import fs from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.resolve(process.cwd(), 'public', 'swagger.json');
    if (fs.existsSync(filePath)) {
      const json = fs.readFileSync(filePath, 'utf-8');
      return new NextResponse(json, {
        headers: { 'content-type': 'application/json' },
      });
    }
  } catch (e) {
    // ignore and fallback to dynamic generation below
  }

  // Fallback: dynamically generate in dev environments where file may not exist
  const { swaggerOptions } = await import('../../../lib/swagger');
  const swaggerJsdoc = (await import('swagger-jsdoc')).default;
  const spec = swaggerJsdoc(swaggerOptions);
  return NextResponse.json(spec);
}
