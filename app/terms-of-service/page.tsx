import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Avegatasta Jal Urja Solutions',
};

export default function TermsOfServicePage() {
  return (
    <>
      <Navbar />
      <main className="pt-28 sm:pt-32 pb-20 px-6 lg:px-12 xl:px-24 max-w-4xl mx-auto">
        <h1 className="text-3xl font-black text-brand-950 mb-2">Terms of Service</h1>
        <p className="text-sm text-slate-400 mb-10">Last updated: April 2025</p>

        <div className="prose prose-slate max-w-none">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using this website, you accept and agree to be bound by these Terms of
            Service. If you do not agree, please do not use this website.
          </p>

          <h2>2. Use of Website</h2>
          <p>
            This website is provided for informational purposes about Avegatasta Jal Urja Solutions
            products and services. You may not use this website for any unlawful purpose or in any way
            that could damage, disable, or impair the website.
          </p>

          <h2>3. Product Information</h2>
          <p>
            We strive to keep product information accurate and up to date. However, prices,
            availability, and specifications are subject to change without notice. Contact us directly
            to confirm current details before placing an order.
          </p>

          <h2>4. Intellectual Property</h2>
          <p>
            All content on this website, including text, images, and logos, is the property of
            Avegatasta Jal Urja Solutions or its licensors and is protected by applicable intellectual
            property laws.
          </p>

          <h2>5. Limitation of Liability</h2>
          <p>
            Avegatasta Jal Urja Solutions shall not be liable for any indirect, incidental, or
            consequential damages arising from the use of, or inability to use, this website.
          </p>

          <h2>6. Contact Us</h2>
          <p>
            For questions about these Terms, contact us at{' '}
            <a href="mailto:sales@avegatasta.com">sales@avegatasta.com</a>.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
