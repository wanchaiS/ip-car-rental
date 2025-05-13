import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCars } from '../hooks/useCars';
import useLocalStorage from '../hooks/useLocalStorage';
import type { Car, Reservation } from '../types/core.types';

export default function Main() {
  const { cars, loading, error } = useCars();
  const [search, setSearch] = useState('');
  const [filterSearch, setFilterSearch] = useState('');
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [filterBy, setFilterBy] = useState<'category' | 'brand'>('category');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [, setReservation] = useLocalStorage<Reservation>('reservation', {car: null, form: {name: '', email: '', phone: '', driverLicense: '', startDate: '', rentalPeriod: 0}});

  // Update filteredCars when cars are loaded
  useEffect(() => {
    if (cars) setFilteredCars(cars);
  }, [cars]);

  // Generate search suggestions
  const searchSuggestions = (cars || []).reduce((suggestions, car) => {
    const searchTerms = [
      car.brand,
      car.carType,
      car.carModel,
      (car.description || '').split(' ').slice(0, 5).join(' ')
    ];
    searchTerms.forEach(term => {
      if (term && term.toLowerCase().includes(search.toLowerCase()) && !suggestions.includes(term)) {
        suggestions.push(term);
      }
    });
    return suggestions;
  }, [] as string[]);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtering logic: applies search and then filter
  const getFilteredCars = (searchTerm: string, filterTerm: string, filterByValue: 'category' | 'brand') => {
    let results = cars || [];
    // Apply search term if present
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      results = results.filter(car =>
        (car.carModel || '').toLowerCase().includes(term) ||
        (car.brand || '').toLowerCase().includes(term) ||
        (car.carType || '').toLowerCase().includes(term) ||
        (car.description || '').toLowerCase().includes(term)
      );
    }
    // Apply filter if filterSearch is present
    if (filterTerm.trim()) {
      const filter = filterTerm.trim().toLowerCase();
      if (filterByValue === 'category') {
        results = results.filter(car => (car.carType || '').toLowerCase().includes(filter));
      } else {
        results = results.filter(car => (car.brand || '').toLowerCase().includes(filter));
      }
    }
    return results;
  };

  // Handle suggestion click in hero search
  const handleSuggestionClick = (suggestion: string) => {
    setSearch(suggestion);
    setShowSuggestions(false);
    setFilterSearch('');
    setFilterBy('category');
    setFilteredCars(getFilteredCars(suggestion, '', 'category'));
  };

  // Filter form submit (Search button or Enter in filter input)
  const handleFilter = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFilteredCars(getFilteredCars(search, filterSearch, filterBy));
  };

  // Handle Enter key in filter input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setFilteredCars(getFilteredCars(search, filterSearch, filterBy));
    }
  };

  // Hero search input handler (shows suggestions, updates search state)
  const handleHeroSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setShowSuggestions(true);
  };

  // Filter search input handler (updates filterSearch state)
  const handleFilterSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterSearch(e.target.value);
  };

  // FilterBy change handler
  const handleFilterByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterBy(e.target.value as 'category' | 'brand');
  };

  const getGridContent = () => {
    if (loading) {
      return <div className="text-center py-10">Loading cars...</div>;
    }
    if (error) {
      return <div className="text-center py-10 text-red-600">Error loading cars: {error.message}</div>;
    }

    if (filteredCars.length === 0) {
      return <div className="text-center py-10">No cars found</div>;
    }

    return    (<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCars.map(car => (
          <div key={String(car.vin)} className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col transition-transform hover:-translate-y-1 hover:shadow-lg">
            <div className="relative aspect-[4/3] bg-gray-100">
              <img src={String(car.image)} alt={String(car.carModel)} className="w-[400px] h-[400px] object-cover" />
              {!!car.available && (
                <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">Available</span>
              )}
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-900">{String(car.brand)} {String(car.carModel)}</h3>
                <span className="text-blue-700 font-bold">${String(car.pricePerDay)}/day</span>
              </div>
              <div className="text-gray-500 text-sm mb-2">{String(car.carType)}</div>
              <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-3">
                <span>📅 {String(car.yearOfManufacture)}</span>
                <span>🛣️ {String(car.mileage)}</span>
                <span>⛽ {String(car.fuelType)}</span>
              </div>
              <p className="text-gray-600 text-sm flex-1">{String(car.description)}</p>
              <button
                className={`mt-4 w-full py-2 rounded-lg font-semibold transition-colors ${car.available ? 'bg-orange-200 text-orange-900 hover:bg-orange-300' : 'bg-gray-300 text-gray-400 cursor-not-allowed'}`}
                disabled={!car.available}
                onClick={() => {
                  setReservation((prev) => ({...prev, car}))
                  navigate('/reservation')
                }}
              >
                Rent Now
              </button>
            </div>
          </div>
        ))}
      </div>)
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-100/80 to-[#f6fbfc] md:py-16 p-4 text-center rounded-xl shadow-sm md:mb-10 mb-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Find Your Perfect Rental Car</h1>
        <p className="text-lg text-gray-600 mb-8">Browse through our extensive collection of vehicles and find the perfect car for your next journey</p>
        <form className="flex justify-center w-full max-w-2xl mx-auto mb-4" onSubmit={e => e.preventDefault()}>
          <div ref={searchRef} className="flex-1 relative">
            <input
              type="text"
              value={search}
              onChange={handleHeroSearchChange}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search by car type, brand, or model..."
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-gray-800 pr-10"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch('');
                  setShowSuggestions(false);
                  setFilteredCars(cars || []);
                  setFilterSearch('');
                  setFilterBy('category');
                }}
                className="absolute right-3  top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            {showSuggestions && search && searchSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
                {searchSuggestions.map((suggestion: string, index: number) => (
                  <button
                    key={index}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </form>
      </section>

      {/* Filters */}
      <section className=" md:max-w-2xl md:mx-auto mb-8">
        <form className="w-full" onSubmit={e => handleFilter(e)}>
          <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3 w-full md:w-auto md:rounded-lg md:border md:border-gray-300 md:bg-white md:shadow-sm md:focus-within:ring-2 md:focus-within:ring-blue-400 items-stretch relative">
            <div className="relative w-full md:flex-1">
              <input
                type="text"
                value={filterSearch}
                onChange={handleFilterSearchChange}
                onKeyDown={handleKeyDown}
                placeholder="What are you looking for?"
                className="w-full px-4 py-3 h-12 border border-gray-300 md:border-0 rounded-lg md:rounded-l-lg md:rounded-none focus:ring-2 focus:ring-blue-400 md:focus:ring-0 md:focus:outline-none text-gray-800 bg-white md:bg-transparent transition"
              />
              {filterSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setFilterSearch('');
                    setFilteredCars(getFilteredCars(search, '', filterBy));
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <select
              value={filterBy}
              onChange={handleFilterByChange}
              className="w-full md:w-40 px-4 py-3 h-12 border border-gray-300 md:border-0 rounded-lg md:rounded-none focus:ring-2 focus:ring-blue-400 md:focus:ring-0 md:focus:outline-none bg-white md:bg-transparent text-gray-700 transition"
            >
              <option value="category">Category</option>
              <option value="brand">Brand</option>
            </select>
            <button
              type="submit"
              className="w-full md:w-32 px-6 py-3 h-12 rounded-lg md:rounded-r-lg md:rounded-none border border-gray-300 md:border-0 bg-blue-700 hover:bg-blue-800 text-white focus:ring-2 focus:ring-blue-400 md:focus:ring-0 md:focus:outline-none font-semibold transition"
            >
              Search
            </button>
          </div>
        </form>
      </section>
      <section className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-8 text-gray-900">Available Cars</h2>
        {getGridContent()}
      </section>
     
    </div>
  );
} 