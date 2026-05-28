import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Avegatasta Jal Urja Solutions',
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="pt-28 sm:pt-32 pb-20 px-6 lg:px-12 xl:px-24 max-w-4xl mx-auto">
        <h1 className="text-3xl font-black text-brand-950 mb-2">Privacy Policy</h1>
        <p className="text-sm text-slate-400 mb-10">Last updated: April 2025</p>

        <div className="prose prose-slate max-w-none">
          <h2>1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us, such as your name, email address, phone
            number, and any other details you share when submitting an inquiry or contacting us.
          </p>

          <h2>2. How We Use Your Information</h2>
          <p>
            We use the information we collect to respond to your inquiries, provide product and service
            information, and improve our website experience. We do not sell or share your personal
            information with third parties for marketing purposes.
          </p>

          <h2>3. Data Retention</h2>
          <p>
            We retain your personal information only for as long as necessary to fulfil the purposes for
            which it was collected, or as required by law.
          </p>

          <h2>4. Cookies</h2>
          <p>
            Our website may use cookies to enhance your browsing experience. See our{' '}
            <a href="/cookies">Cookie Policy</a> for details.
          </p>

          <h2>5. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at{' '}
            <a href="mailto:sales@avegatasta.com">sales@avegatasta.com</a>.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
