import React from 'react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="bg-background min-h-screen">
      <div className="bg-[#f8f8f8] py-20 text-center border-b border-surfaceBorder mb-12">
        <h1 className="text-4xl md:text-5xl font-serif text-textPrimary mb-4">About VEJO STUDIO</h1>
        <p className="text-textSecondary max-w-2xl mx-auto px-4">
          Redefining premium essentials for the modern lifestyle.
        </p>
      </div>

      <div className="container-custom max-w-4xl pb-24">
        <div className="space-y-12 text-textSecondary leading-relaxed">
          <section className="space-y-4">
            <h2 className="text-2xl font-serif text-textPrimary">Our Story</h2>
            <p>
              Founded in 2024, VEJO STUDIO was born from a simple idea: that everyday essentials should be beautifully designed, meticulously crafted, and accessible. We noticed a gap in the market for premium quality products that do not come with an exorbitant price tag, and we set out to change that.
            </p>
            <p>
              What started as a small passion project has grown into a dedicated team of designers, artisans, and dreamers who are committed to bringing you the best in minimalist design and sustainable practices.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-serif text-textPrimary">Our Philosophy</h2>
            <p>
              At VEJO STUDIO, we believe in the power of less, but better. We embrace minimalism not just as an aesthetic choice, but as a way of living. Every product in our collection is thoughtfully curated to add value, functionality, and beauty to your daily life without unnecessary clutter.
            </p>
            <p>
              We source only the finest materials—from full-grain Italian leathers to sustainable organic cottons—and partner with ethical manufacturers who share our commitment to quality and craftsmanship.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-serif text-textPrimary">Commitment to Quality</h2>
            <p>
              We are obsessed with details. Before any product reaches your hands, it goes through rigorous testing and quality control to ensure it meets our exacting standards. We want you to love your VEJO STUDIO products not just today, but for years to come.
            </p>
          </section>
        </div>

        <div className="mt-16 pt-12 border-t border-surfaceBorder text-center">
          <h2 className="text-2xl font-serif text-textPrimary mb-6">Experience the Difference</h2>
          <Link href="/products" className="inline-block bg-accent text-white px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-opacity-90 transition-colors">
            Shop Our Collection
          </Link>
        </div>
      </div>
    </div>
  );
}
