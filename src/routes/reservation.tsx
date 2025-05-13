import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reserveCar } from '../api/cars';
import useLocalStorage from '../hooks/useLocalStorage';
import type { Reservation } from '../types/core.types';

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  driverLicense?: string;
  startDate?: string;
  rentalPeriod?: string;
  [key: string]: string | undefined;
}

export default function Reservation() {
  const navigate = useNavigate();
  const [reservation, setReservation] = useLocalStorage<Reservation>('reservation', { 
    car: null, 
    form: { name: '', email: '', phone: '', driverLicense: '', startDate: '', rentalPeriod: 0 } 
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isFormValid, setIsFormValid] = useState(false);
  const car = reservation.car;
  const [submitted, setSubmitted] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // Validate form fields
  const validateField = (name: string, value: string | number): string | undefined => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    const today = new Date();
    const selectedDate = name === 'startDate' ? new Date(value.toString()) : null;

    switch (name) {
      case 'name':
        return value.toString().trim() ? undefined : 'Name is required';
      case 'email':
        return emailRegex.test(value.toString()) 
          ? undefined 
          : 'Please enter a valid email address (e.g., john.doe@example.com)';
      case 'phone':
        return phoneRegex.test(value.toString()) 
          ? undefined 
          : 'Please enter a valid phone number (e.g., +1234567890 or 123-456-7890)';
      case 'driverLicense':
        return value.toString().trim() 
          ? undefined 
          : 'Driver\'s license number is required';
      case 'startDate':
        return selectedDate && selectedDate.setHours(0,0,0,0) >= today.setHours(0,0,0,0)
          ? undefined 
          : 'Please select a date today or later';
      case 'rentalPeriod':
        return Number(value) > 0 
          ? undefined 
          : 'Please enter a rental period of at least 1 day';
      default:
        return undefined;
    }
  };

  // Check if all fields are valid
  useEffect(() => {
    const hasErrors = Object.keys(errors).length > 0;
    const allFieldsFilled = Object.values(reservation.form).every(value => 
      value !== null && value !== undefined && value !== ''
    );
    console.log('Object.keys(errors)', Object.keys(errors))
    setIsFormValid(!hasErrors && allFieldsFilled);
  }, [errors, reservation.form]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    const error = validateField(name, value);
    
    setErrors(prev => {
      // If there's no error, remove the field from errors object
      if (!error) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [name]: _, ...rest } = prev;
        return rest;
      }
      // If there is an error, update the errors object
      return {
        ...prev,
        [name]: error
      };
    });

    setReservation(prev => ({
      ...prev,
      form: { ...prev.form, [name]: value }
    }));
  }

  function handleCancel() {
    setReservation(prev => ({ ...prev, car: null }));
    navigate('/home');
  }

  async function handleConfirmOrder() {
    try {
      if (car && car.vin) {
        await reserveCar(car.vin);
        setConfirmed(true);
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'Car is no longer available for reservation') {
        setReservation(prev => ({ ...prev, car: prev.car ? { ...prev.car, available: false } : null }));
      } else {
        console.error('Failed to confirm order:', error);
        alert('Failed to confirm order. Please try again.');
      }
    }
  }

  if (!car) {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-8 text-center">
        <h2 className="text-2xl font-bold mb-4 text-red-700">No Car Selected</h2>
        <p className="mb-4">Please select a car to reserve from the main page.</p>
        <a href="/" className="inline-block mt-6 px-6 py-2 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition">Back to Home</a>
      </div>
    );
  }

  // If car is unavailable, show warning and back button, do not show form
  if (car.available === false) {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-8 text-center">
        <h2 className="text-2xl font-bold mb-4 text-red-700">Car Unavailable</h2>
        <p className="mb-4">Sorry, this car is no longer available for reservation.</p>
        <button
          className="mt-6 px-6 py-2 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition"
          onClick={() => {
            setReservation(prev => ({ ...prev, car: null }));
            navigate('/');
          }}
        >
          Back to Car Selection
        </button>
      </div>
    );
  }

  const totalPrice = (car.pricePerDay ?? 0) * Number(reservation.form.rentalPeriod || 1);

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-8 text-center">
        <h2 className="text-2xl font-bold mb-4 text-blue-700">Place Your Order</h2>
        <p className="mb-4">You're about to reserve the <span className="font-semibold">{car.brand} {car.carModel}</span>.</p>
        <p className="mb-2">Please review your details:</p>
        <div className="text-left bg-gray-50 p-4 rounded-lg mb-6">
          <p><span className="font-semibold">Name:</span> {reservation.form.name}</p>
          <p><span className="font-semibold">Email:</span> {reservation.form.email}</p>
          <p><span className="font-semibold">Phone:</span> {reservation.form.phone}</p>
          <p><span className="font-semibold">Start Date:</span> {reservation.form.startDate}</p>
          <p><span className="font-semibold">Rental Period:</span> {reservation.form.rentalPeriod} days</p>
          <p><span className="font-semibold">Total Price:</span> ${totalPrice}</p>
        </div>
        {!confirmed ? (
          <button
            onClick={handleConfirmOrder}
            className="inline-block mt-6 px-6 py-2 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition"
            type="button"
          >
            Confirm Order
          </button>
        ) : (
          <div className="mt-6">
            <span className="inline-block px-6 py-2 bg-green-100 text-green-800 rounded-lg font-semibold">Order Status: Confirmed</span>
            <div className="mt-4">
              <a href="/home" className="inline-block px-6 py-2 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition">Back to Home</a>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-8 flex flex-col md:flex-row gap-8">
      {/* Car Info */}
      <div className="md:w-1/2 flex flex-col items-center">
        <img src={car.image ?? ''} alt={car.carModel ?? ''} className="w-[400px] h-[400px] object-cover rounded-lg mb-4" />
        <h2 className="text-xl font-bold mb-1">{car.brand} {car.carModel}</h2>
        <div className="text-gray-500 text-sm mb-2">{car.carType}</div>
        <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-3">
          <span>📅 {car.yearOfManufacture}</span>
          <span>🛣️ {car.mileage}</span>
          <span>⛽ {car.fuelType}</span>
        </div>
        <p className="text-gray-600 text-sm mb-2">{car.description}</p>
        <div className="text-blue-700 font-bold text-lg">${car.pricePerDay}/day</div>
      </div>
      {/* Reservation Form */}
      <form className="md:w-1/2 space-y-5" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
        <h3 className="text-lg font-semibold mb-2">Reservation Details</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input 
            name="name" 
            value={reservation.form.name} 
            onChange={handleChange} 
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input 
            name="phone" 
            value={reservation.form.phone} 
            onChange={handleChange} 
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input 
            name="email" 
            type="email" 
            value={reservation.form.email} 
            onChange={handleChange} 
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Driver's License</label>
          <input 
            name="driverLicense" 
            value={reservation.form.driverLicense} 
            onChange={handleChange} 
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 ${errors.driverLicense ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.driverLicense && <p className="text-red-500 text-sm mt-1">{errors.driverLicense}</p>}
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input 
              name="startDate" 
              type="date" 
              value={reservation.form.startDate} 
              onChange={handleChange} 
              min={new Date().toISOString().split('T')[0]} 
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 ${errors.startDate ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Rental Period (days)</label>
            <input 
              name="rentalPeriod" 
              type="number" 
              min={1} 
              value={reservation.form.rentalPeriod} 
              onChange={handleChange} 
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 ${errors.rentalPeriod ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.rentalPeriod && <p className="text-red-500 text-sm mt-1">{errors.rentalPeriod}</p>}
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg text-center font-semibold text-lg">
          Total Price: <span className="text-blue-700">${totalPrice}</span>
        </div>
        <div className="flex gap-4">
          <button 
            type="submit" 
            disabled={!isFormValid}
            className={`flex-1 py-2 rounded-lg font-semibold transition ${
              isFormValid 
                ? 'bg-blue-700 text-white hover:bg-blue-800' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Submit Reservation
          </button>
          <button 
            type="button" 
            onClick={handleCancel} 
            className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
} 