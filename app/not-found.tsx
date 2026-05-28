import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <h1 className="text-7xl font-bold text-gray-900 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
      <p className="text-gray-600 max-w-md mb-8">
        Sorry, we couldn&apos;t find the page you&apos;re looking for. It may have been moved or
        removed.
      </p>
      <Link
        href="/"
        className="inline-block bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
