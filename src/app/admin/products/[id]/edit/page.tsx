// @ts-nocheck
/* eslint-disable */
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Image as ImageIcon } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

import { updateProduct } from '../../actions';

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState("Women's Accessories");
  const [imageUrl, setImageUrl] = useState('');
  const [colors, setColors] = useState('');
  const [sizes, setSizes] = useState('');
  const [stock, setStock] = useState('0');

  useEffect(() => {
    async function loadProduct() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', params.id)
        .single();
      
      if (data) {
        setName(data.name || '');
        setDescription(data.description || '');
        setPrice(data.price?.toString() || '');
        setCategory(data.category || "Women's Accessories");
        setImageUrl(data.image_url || '');
        setColors(data.colors ? data.colors.join(', ') : '');
        setSizes(data.sizes ? data.sizes.join(', ') : '');
        setStock(data.stock?.toString() || '0');
      } else if (error) {
        alert('Error loading product: ' + error.message);
      }
      setLoading(false);
    }
    loadProduct();
  }, [params.id, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const colorsArray = colors.split(',').map(c => c.trim()).filter(Boolean);
    const sizesArray = sizes.split(',').map(s => s.trim()).filter(Boolean);

    const formData = {
      name,
      description,
      price: parseInt(price),
      category,
      image_url: imageUrl,
      colors: colorsArray.length > 0 ? colorsArray : null,
      sizes: sizesArray.length > 0 ? sizesArray : null,
      stock: parseInt(stock) || 0
    };

    const result = await updateProduct(params.id, formData);

    setSaving(false);

    if (!result.success) {
      alert('Error updating product: ' + result.error);
    } else {
      router.push('/admin/products');
      router.refresh();
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-gray-500">Loading product data...</div>;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/products" className="text-gray-500 hover:text-black bg-white p-2 rounded-full shadow-sm border border-gray-200">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-3xl font-serif font-bold text-gray-900">Edit Product</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-accent focus:border-accent"
                placeholder="e.g. Minimalist Leather Tote"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea 
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-accent focus:border-accent"
                placeholder="Describe the product..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-accent focus:border-accent"
                  placeholder="e.g. 14500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Count *</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-accent focus:border-accent"
                  placeholder="e.g. 50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select 
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-accent focus:border-accent"
              >
                <option value="Women's Accessories">Women's Accessories</option>
                <option value="Men's Accessories">Men's Accessories</option>
                <option value="Home Accessories">Home Accessories</option>
                <option value="Lighting">Lighting</option>
                <option value="Lifestyle">Lifestyle</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Main Image URL *</label>
              <div className="flex gap-4">
                <input 
                  type="text" 
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-accent focus:border-accent"
                  placeholder="e.g. /images/products/1.jpg or https://..."
                />
              </div>
              {imageUrl && (
                <div className="mt-4 relative w-32 h-32 bg-gray-100 rounded-md overflow-hidden border border-gray-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageUrl} alt="Preview" className="object-cover w-full h-full" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Colors (Hex Codes)</label>
              <input 
                type="text" 
                value={colors}
                onChange={(e) => setColors(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-accent focus:border-accent"
                placeholder="e.g. #000000, #FFFFFF, #D2B48C"
              />
              <p className="text-xs text-gray-500 mt-1">Comma-separated hex codes</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sizes</label>
              <input 
                type="text" 
                value={sizes}
                onChange={(e) => setSizes(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-accent focus:border-accent"
                placeholder="e.g. S, M, L, XL or One Size"
              />
              <p className="text-xs text-gray-500 mt-1">Comma-separated sizes</p>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200 flex justify-end gap-4">
            <Link 
              href="/admin/products"
              className="px-6 py-2.5 border border-gray-300 rounded-md font-medium text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button 
              type="submit" 
              disabled={saving}
              className="px-6 py-2.5 bg-accent text-white rounded-md font-medium text-sm flex items-center gap-2 hover:bg-opacity-90 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
