// src/types/index.d.ts
interface IDBDatabaseInfo {
  name: string; // Override to make it non-optional
  version?: number;
}