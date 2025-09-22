/**
 * Utility functions for generating Insightful-compatible IDs
 */

/**
 * Generate a 15-character ID in Insightful's format
 * IDs typically start with 'w' and contain lowercase letters, numbers, and occasionally '-' or '_'
 */
export function generateInsightfulId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789-_';
  let id = 'w'; // Most Insightful IDs start with 'w'
  
  for (let i = 0; i < 14; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  
  return id;
}

/**
 * Validate if a string is a valid Insightful ID (15 characters)
 */
export function isValidInsightfulId(id: string): boolean {
  return typeof id === 'string' && id.length === 15;
}

/**
 * Generate multiple unique IDs
 */
export function generateUniqueIds(count: number): string[] {
  const ids = new Set<string>();
  
  while (ids.size < count) {
    ids.add(generateInsightfulId());
  }
  
  return Array.from(ids);
}

/**
 * Generate a UUID for internal use (Windows, Screenshots)
 */
export function generateUUID(): string {
  return crypto.randomUUID ? crypto.randomUUID() : 
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
}
