import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { BusinessMaterial } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rjmujizjdamjgejagxax.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqbXVqaXpqZGFtamdlamFneGF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MjU2MTcsImV4cCI6MjEwNTMwMTYxN30.0QdD4YtO4vd6FLbhh43AV1S6OSq81BF3RLkEyXldMe8';

let supabase: SupabaseClient;

try {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });
} catch (error) {
  console.warn('Supabase initialization warning:', error);
  supabase = {} as any;
}

export function toSupabaseMaterial(m: Partial<BusinessMaterial>): Record<string, any> {
  const row: Record<string, any> = {};
  if (m.id !== undefined) row.id = m.id;
  if (m.userId !== undefined) row.user_id = m.userId;
  if (m.name !== undefined) row.name = m.name;
  if (m.nature !== undefined) row.nature = m.nature;
  if (m.unit !== undefined) row.unit = m.unit;
  if (m.stockQuantity !== undefined) row.stock_quantity = m.stockQuantity;
  if (m.minQuantityAlert !== undefined) row.min_quantity_alert = m.minQuantityAlert;
  if (m.unitCostPrice_cents !== undefined) row.unit_cost_price_cents = m.unitCostPrice_cents;
  if (m.hasConversion !== undefined) row.has_conversion = Boolean(m.hasConversion);
  if (m.capacityPerUnit !== undefined) row.capacity_per_unit = m.capacityPerUnit;
  if (m.consumptionUnit !== undefined) row.consumption_unit = m.consumptionUnit;
  if (m.supplierId !== undefined) row.supplier_id = m.supplierId;
  if (m.createdAt !== undefined) row.created_at = m.createdAt;
  if (m.updatedAt !== undefined) row.updated_at = m.updatedAt;
  return row;
}

export function fromSupabaseMaterial(row: Record<string, any>): BusinessMaterial {
  return {
    id: row.id,
    userId: row.user_id || 'local-user',
    name: row.name || '',
    nature: row.nature || 'raw_material',
    unit: row.unit || 'pièce',
    stockQuantity: typeof row.stock_quantity === 'number' ? row.stock_quantity : parseFloat(row.stock_quantity || 0),
    minQuantityAlert: typeof row.min_quantity_alert === 'number' ? row.min_quantity_alert : parseFloat(row.min_quantity_alert || 0),
    unitCostPrice_cents: typeof row.unit_cost_price_cents === 'number' ? row.unit_cost_price_cents : parseInt(row.unit_cost_price_cents || 0, 10),
    hasConversion: Boolean(row.has_conversion),
    capacityPerUnit: row.capacity_per_unit !== null && row.capacity_per_unit !== undefined ? parseFloat(row.capacity_per_unit) : undefined,
    consumptionUnit: row.consumption_unit || undefined,
    supplierId: row.supplier_id || undefined,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

export { supabase };
