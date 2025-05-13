import supabase from "../lib/supabaseClient";


export async function getCars() {
    return await supabase.from('Cars').select().order('Brand', { ascending: true })
}

export async function reserveCar(vin: string) {
    const { data: car, error: fetchError } = await supabase
        .from('Cars')
        .select('Available')
        .eq('Vin', vin)
        .single();

    if (fetchError) {
        throw new Error('Failed to fetch car status');
    }

    if (!car.Available ) {
        throw new Error('Car is no longer available for reservation');
    }

    return await supabase
        .from('Cars')
        .update({ Available: false })
        .eq('Vin', vin);
}
