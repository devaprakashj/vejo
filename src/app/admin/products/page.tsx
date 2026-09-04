import React from 'react';
import Link from 'next/link';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Image from 'next/image';

export default async function AdminProductsPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  // Fetch products
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-serif font-bold text-gray-900">Products</h1>
        <Link 
          href="/admin/products/new" 
          className="bg-accent text-white px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 hover:bg-opacity-90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
            <tr>
              <th scope="col" className="px-6 py-4">Product</th>
              <th scope="col" className="px-6 py-4">Category</th>
              <th scope="col" className="px-6 py-4">Price</th>
              <th scope="col" className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products && products.length > 0 ? (
              products.map((product) => (
                <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-4">
                    <div className="relative w-12 h-12 bg-gray-100 rounded overflow-hidden">
                      <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                    </div>
                    {product.name}
                  </td>
                  <td className="px-6 py-4">{product.category}</td>
                  <td className="px-6 py-4">₹{product.price.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3">
                      <Link href={`/admin/products/${product.id}/edit`} className="text-blue-600 hover:text-blue-800">
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button className="text-red-600 hover:text-red-800">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No products found. Click "Add Product" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
