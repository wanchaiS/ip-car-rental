import { Car } from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';

interface LayoutProps {
  hasReservation?: boolean;
  children?: React.ReactNode;
}

const Layout = ({ hasReservation = false, children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#f6fbfc]">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-9">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-5">
          <Link to="/" className="flex items-center space-x-3 group">
            <span className="inline-block bg-blue-600 rounded-full p-2">
              {/* Simple car icon SVG */}
              <Car color="white" />
            </span>
            <span className="text-2xl font-bold text-blue-700 group-hover:text-blue-900 transition">CarRental</span>
          </Link>
          <nav className="flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-blue-700 font-medium transition">Home</Link>
            <div className="relative">
              <Link to="/reservation" className="text-gray-700 hover:text-blue-700 font-medium transition">Reservation</Link>
              {hasReservation && (
                <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">!</span>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-10">
        {children ? children : <Outlet />}
      </main>

    </div>
  );
};

export default Layout; 