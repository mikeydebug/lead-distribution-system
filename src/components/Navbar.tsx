import Link from 'next/link';

export function Navbar() {
  return (
    <nav className="bg-gray-900 border-b border-gray-800 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                Prowider<span className="text-white">Mini</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/request-service"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium hover:border-gray-300 hover:text-gray-300 transition-colors duration-200"
              >
                Customer Portal
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium hover:border-gray-300 hover:text-gray-300 transition-colors duration-200"
              >
                Provider Dashboard
              </Link>
              <Link
                href="/test-tools"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-purple-400 hover:border-purple-400 transition-colors duration-200"
              >
                Test Tools (Admin)
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
