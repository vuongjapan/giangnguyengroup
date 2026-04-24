import { supabase } from '@/integrations/supabase/client';

/**
 * Entity types supported by the unified trash bin.
 * Map: entity_type -> source table name in Supabase.
 */
export const TRASH_TABLE_MAP: Record<string, string> = {
  order: 'orders',
  product: 'products',
  member: 'profiles',
  hotel: 'hotels',
  store: 'stores',
  combo: 'combos',
  coupon: 'coupons',
  review: 'product_reviews',
  agent: 'agents',
};

export const TRASH_LABELS: Record<string, string> = {
  order: 'Đơn hàng',
  product: 'Sản phẩm',
  member: 'Thành viên',
  hotel: 'Khách sạn',
  store: 'Cửa hàng',
  combo: 'Combo',
  coupon: 'Mã giảm giá',
  review: 'Đánh giá',
  agent: 'Đại lý',
};

/**
 * Soft-delete: snapshot the row into trash_bin then delete from source table.
 * Returns true on success.
 */
export async function softDelete(
  entityType: keyof typeof TRASH_TABLE_MAP,
  entityId: string,
  displayName: string
): Promise<boolean> {
  const table = TRASH_TABLE_MAP[entityType];
  if (!table) return false;

  // 1. Fetch full row
  const { data: row, error: fetchErr } = await supabase
    .from(table as any)
    .select('*')
    .eq('id', entityId)
    .maybeSingle();
  if (fetchErr || !row) return false;

  // 2. Save snapshot into trash_bin
  const { data: { user } } = await supabase.auth.getUser();
  const { error: insertErr } = await supabase.from('trash_bin' as any).insert({
    entity_type: entityType,
    entity_id: entityId,
    display_name: displayName.slice(0, 200),
    snapshot: row,
    deleted_by: user?.id ?? null,
  });
  if (insertErr) return false;

  // 3. Delete from source
  const { error: delErr } = await supabase.from(table as any).delete().eq('id', entityId);
  if (delErr) {
    // rollback snapshot
    await supabase.from('trash_bin' as any).delete().eq('entity_id', entityId).eq('entity_type', entityType);
    return false;
  }
  return true;
}

/**
 * Restore: re-insert snapshot into source table, then remove trash entry.
 */
export async function restoreFromTrash(trashId: string): Promise<boolean> {
  const { data: trash } = await supabase
    .from('trash_bin' as any)
    .select('*')
    .eq('id', trashId)
    .maybeSingle();
  if (!trash) return false;

  const t = trash as any;
  const table = TRASH_TABLE_MAP[t.entity_type];
  if (!table) return false;

  const snapshot = { ...(t.snapshot as Record<string, any>) };
  const { error } = await supabase.from(table as any).insert(snapshot);
  if (error) return false;

  await supabase.from('trash_bin' as any).delete().eq('id', trashId);
  return true;
}

/**
 * Permanently delete a trash entry (no recovery).
 */
export async function purgeTrash(trashId: string): Promise<boolean> {
  const { error } = await supabase.from('trash_bin' as any).delete().eq('id', trashId);
  return !error;
}

export async function emptyTrash(): Promise<boolean> {
  const { error } = await supabase.from('trash_bin' as any).delete().neq('id', '00000000-0000-0000-0000-000000000000');
  return !error;
}
