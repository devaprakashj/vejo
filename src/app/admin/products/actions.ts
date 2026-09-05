'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

function getAdminSupabase() {
  const cookieStore = cookies();
  
  // Using Service Role Key to bypass RLS for admin operations
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}

export async function updateProduct(id: string, formData: any) {
  const supabase = getAdminSupabase();
  
  const { error } = await supabase
    .from('products')
    .update(formData)
    .eq('id', id);
    
  if (error) {
    return { success: false, error: error.message };
  }
  
  revalidatePath('/admin/products');
  return { success: true };
}

export async function createProduct(formData: any) {
  const supabase = getAdminSupabase();
  
  const { data, error } = await supabase
    .from('products')
    .insert([formData])
    .select();
    
  if (error) {
    return { success: false, error: error.message };
  }
  
  revalidatePath('/admin/products');
  return { success: true, data };
}
