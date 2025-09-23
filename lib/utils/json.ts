// lib/utils/json.ts

/**
 * Custom JSON stringifier that handles BigInt serialization.
 * JSON.stringify does not support BigInts, so we convert them to strings.
 * @param data The data to be stringified.
 * @returns A JSON string.
 */
export const stringifyWithBigInts = (data: any): string => {
  const replacer = (key: string, value: any) => {
    if (typeof value === 'bigint') {
      return value.toString();
    }
    return value;
  };
  return JSON.stringify(data, replacer);
};

/**
 * A helper to create a NextResponse with BigInt support.
 * @param data The data to be sent in the response.
 * @param options The response options (e.g., status).
 * @returns A NextResponse object.
 */
import { NextResponse } from 'next/server';

export const jsonWithBigInts = (data: any, options?: ResponseInit): NextResponse => {
  const body = stringifyWithBigInts(data);
  const headers = {
    ...options?.headers,
    'Content-Type': 'application/json',
  };
  return new NextResponse(body, { ...options, headers });
};
