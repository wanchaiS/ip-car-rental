import { PostgrestError } from "@supabase/supabase-js"
import { useCallback, useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import { getCars } from "../api/cars"
import type { Car, Reservation } from "../types/core.types"
import type { Tables } from "../types/database.types"
import useLocalStorage from "./useLocalStorage"

function mapDbCarToCar(dbCar: Tables<"Cars">): Car {
  return {
    brand: dbCar.Brand ?? '',
    carModel: dbCar.CarModel ?? '',
    carType: dbCar.CarType ?? '',
    description: dbCar.Description ?? '',
    fuelType: dbCar.FuelType ?? '',
    image: dbCar.Image ?? '',
    mileage: dbCar.Mileage ?? '',
    pricePerDay: dbCar.PricePerDay ?? 0,
    vin: dbCar.Vin,
    yearOfManufacture: dbCar.YearOfManufacture ?? 0,
    available: dbCar.Available ?? false,
  };
}

export const useCars = () => {
    const [error, setError] = useState<PostgrestError | null>(null)
    const [loading, setLoading] = useState(false)
    const [cars, setCars] = useState<Car[]>([])
    const location = useLocation();

    // Use your storage hook for reservation, typed as Reservation
    const [reservation, setReservation] = useLocalStorage<Reservation>('reservation', {
        car: null,
        form: { name: '', email: '', phone: '', driverLicense: '', startDate: '', rentalPeriod: 0 }
    });

    // Helper to sync reservation car with backend data
    const syncReservationCar = useCallback((fetchedCars: Car[]) => {
        if (reservation?.car?.vin) {
            const latestCar = fetchedCars.find(c => c.vin === reservation.car!.vin);
            if (latestCar && latestCar.available !== reservation.car!.available) {
                setReservation({ ...reservation, car: { ...reservation.car!, available: latestCar.available } });
            }
        }
    }, [reservation, setReservation]);

    // Refetch on route change
    useEffect(() => {
        async function refetchCars() {
            setLoading(true);
            const { data, error } = await getCars();
            if (!error) {
                const mapped = (data || []).map(mapDbCarToCar);
                setCars(mapped);
                syncReservationCar(mapped);
            } else {
                setError(error);
            }
            setLoading(false);
        }
        refetchCars();
        return () => {
            setError(null);
            setLoading(false);
        };
    }, [location, syncReservationCar]);

    // Fetch on first render
    useEffect(() => {
        async function fetchCars() {
            setLoading(true);
            const { data, error } = await getCars();
            if (!error) {
                const mapped = (data || []).map(mapDbCarToCar);
                setCars(mapped);
                syncReservationCar(mapped);
            } else {
                setError(error);
            }
            setLoading(false);
        }
        fetchCars();
        return () => {
            setError(null);
            setLoading(false);
        };
    }, [syncReservationCar]);

    return { cars, error, loading }
}