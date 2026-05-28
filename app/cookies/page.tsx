import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy | Avegatasta Jal Urja Solutions',
};

export default function CookiesPage() {
  return (
    <>
      <Navbar />
      <main className="pt-28 sm:pt-32 pb-20 px-6 lg:px-12 xl:px-24 max-w-4xl mx-auto">
        <h1 className="text-3xl font-black text-brand-950 mb-2">Cookie Policy</h1>
        <p className="text-sm text-slate-400 mb-10">Last updated: April 2025</p>

        <div className="prose prose-slate max-w-none">
          <h2>What Are Cookies?</h2>
          <p>
            Cookies are small text files stored on your device when you visit a website. They help the
            website remember your preferences and improve your browsing experience.
          </p>

          <h2>How We Use Cookies</h2>
          <p>We use cookies for the following purposes:</p>
          <ul>
            <li>
              <strong>Essential cookies:</strong> Required for the website to function correctly,
              such as session management.
            </li>
            <li>
              <strong>Analytics cookies:</strong> Help us understand how visitors interact with our
              website so we can improve it.
            </li>
            <li>
              <strong>Chat support cookies:</strong> Used by our live chat provider to maintain your
              support session.
            </li>
          </ul>

          <h2>Managing Cookies</h2>
          <p>
            You can control and delete cookies through your browser settings. Note that disabling
            certain cookies may affect the functionality of this website.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have questions about our use of cookies, contact us at{' '}
            <a href="mailto:sales@avegatasta.com">sales@avegatasta.com</a>.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
