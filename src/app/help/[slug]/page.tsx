import Link from 'next/link';

export default function HelpPage({ params }: { params: { slug: string } }) {
  const titles: Record<string, string> = {
    'terms-and-conditions': 'Terms & Conditions',
    'privacy-policy': 'Privacy Policy',
    'refund-policy': 'Cancellation & Refund Policy',
    'shipping-and-delivery': 'Shipping & Delivery Policy',
    'contact-us': 'Contact Us'
  };

  const title = titles[params.slug] || params.slug.replace('-', ' ').toUpperCase();

  const renderContent = () => {
    switch (params.slug) {
      case 'terms-and-conditions':
        return (
          <div className="space-y-6 text-sm">
            <h2 className="text-xl font-bold">1. Introduction</h2>
            <p>Welcome to VEJO STUDIO. By accessing our website, you agree to these Terms and Conditions. Please read them carefully.</p>
            <h2 className="text-xl font-bold">2. Use of the Site</h2>
            <p>You may use our site only for lawful purposes and in accordance with these Terms. You agree not to use the site in any way that violates any applicable national or international law or regulation.</p>
            <h2 className="text-xl font-bold">3. Intellectual Property Rights</h2>
            <p>The content, features, and functionality of this website are owned by VEJO STUDIO and are protected by international copyright, trademark, and other intellectual property laws.</p>
            <h2 className="text-xl font-bold">4. Products and Pricing</h2>
            <p>All products are subject to availability. We reserve the right to discontinue any products at any time for any reason. Prices for all products are subject to change.</p>
            <h2 className="text-xl font-bold">5. Governing Law</h2>
            <p>These terms and conditions are governed by and construed in accordance with the laws of India and you irrevocably submit to the exclusive jurisdiction of the courts in that location.</p>
            <p className="mt-8">Last Updated: {new Date().toLocaleDateString()}</p>
          </div>
        );
      case 'privacy-policy':
        return (
          <div className="space-y-6 text-sm">
            <h2 className="text-xl font-bold">1. Information We Collect</h2>
            <p>We collect information that you provide directly to us, such as when you create or modify your account, make a purchase, or contact customer support. This includes your name, email address, phone number, and shipping address.</p>
            <h2 className="text-xl font-bold">2. How We Use Your Information</h2>
            <p>We use the information we collect to process your transactions, manage your account, and improve our services. We may also use it to send you updates, security alerts, and support messages.</p>
            <h2 className="text-xl font-bold">3. Information Sharing</h2>
            <p>We do not share your personal information with third parties except as necessary to fulfill your orders (e.g., sharing shipping details with delivery partners or payment details with secure payment gateways like Razorpay).</p>
            <h2 className="text-xl font-bold">4. Data Security</h2>
            <p>We implement reasonable security measures to protect your personal information from unauthorized access, alteration, or disclosure.</p>
            <p className="mt-8">Last Updated: {new Date().toLocaleDateString()}</p>
          </div>
        );
      case 'refund-policy':
        return (
          <div className="space-y-6 text-sm">
            <h2 className="text-xl font-bold">Cancellation Policy</h2>
            <p>You may cancel your order within 24 hours of placing it. To cancel an order, please contact our support team at ritaidevelopers@gmail.com. Once an order has been shipped, it cannot be cancelled.</p>
            <h2 className="text-xl font-bold">Refund Policy</h2>
            <p>We offer refunds for damaged or defective items only. If you receive a damaged item, please contact us within 48 hours of delivery with photographic evidence.</p>
            <h2 className="text-xl font-bold">Process for Refunds</h2>
            <p>Once your return is received and inspected, we will send you an email to notify you of the approval or rejection of your refund. If approved, your refund will be processed, and a credit will automatically be applied to your original method of payment (e.g., Credit Card/UPI via Razorpay) within 5-7 working days.</p>
            <p className="mt-8">Last Updated: {new Date().toLocaleDateString()}</p>
          </div>
        );
      case 'shipping-and-delivery':
        return (
          <div className="space-y-6 text-sm">
            <h2 className="text-xl font-bold">Processing Time</h2>
            <p>All orders are processed within 1-2 business days. Orders are not shipped or delivered on weekends or holidays.</p>
            <h2 className="text-xl font-bold">Shipping Rates & Delivery Estimates</h2>
            <p>Shipping charges for your order will be calculated and displayed at checkout. Standard delivery typically takes 3-7 business days across India.</p>
            <h2 className="text-xl font-bold">Shipment Confirmation & Order Tracking</h2>
            <p>You will receive a Shipment Confirmation email once your order has shipped containing your tracking number(s). The tracking number will be active within 24 hours.</p>
            <p className="mt-8">Last Updated: {new Date().toLocaleDateString()}</p>
          </div>
        );
      case 'contact-us':
        return (
          <div className="space-y-6 text-sm">
            <p>If you have any questions about our products, policies, or your order, please do not hesitate to contact us. We are here to help!</p>
            
            <div className="bg-white p-8 rounded-lg shadow-sm border border-surfaceBorder mt-8">
              <h3 className="text-lg font-bold mb-4">VEJO STUDIO</h3>
              <ul className="space-y-4">
                <li className="flex gap-4">
                  <span className="font-semibold w-24">Email:</span>
                  <a href="mailto:ritaidevelopers@gmail.com" className="text-accent hover:underline">ritaidevelopers@gmail.com</a>
                </li>
                <li className="flex gap-4">
                  <span className="font-semibold w-24">Phone:</span>
                  <span>+91 8667466390</span>
                </li>
                <li className="flex gap-4">
                  <span className="font-semibold w-24">Address:</span>
                  <span>123, Fashion Street, Startup Avenue,<br/>Chennai, Tamil Nadu, 600001, India</span>
                </li>
                <li className="flex gap-4">
                  <span className="font-semibold w-24">Hours:</span>
                  <span>Monday - Friday, 9:00 AM - 6:00 PM (IST)</span>
                </li>
              </ul>
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            <p>
              Thank you for visiting VEJO Studio. This is a placeholder page for our {title.toLowerCase()} section. 
            </p>
            <p>
              If you need immediate assistance, please feel free to reach out to our customer support team directly at 
              <a href="mailto:ritaidevelopers@gmail.com" className="text-accent underline ml-1 hover:no-underline">ritaidevelopers@gmail.com</a>.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] bg-background">
      <div className="bg-[#f8f8f8] py-16 text-center border-b border-surfaceBorder mb-12">
        <h1 className="text-3xl md:text-5xl font-serif text-textPrimary">{title}</h1>
      </div>
      
      <div className="container-custom max-w-3xl pb-24 text-textSecondary leading-relaxed">
        {renderContent()}
        
        {params.slug !== 'contact-us' && (
          <div className="pt-12 text-center mt-12 border-t border-surfaceBorder">
            <p className="mb-6 text-sm">Have more questions? We are here to help.</p>
            <Link href="/help/contact-us" className="inline-block bg-accent text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-opacity-90 transition-colors">
              Contact Support
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
