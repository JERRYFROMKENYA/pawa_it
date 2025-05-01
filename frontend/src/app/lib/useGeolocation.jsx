"use client"
import { useState, useEffect } from 'react';


export default function useGeolocation() {
    const [coordinates, setCoords] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCoords({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            (err) => setError(err.message)
        );
    }, []);

    return { coordinates, error };
}