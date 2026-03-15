import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface AddressDisplayProps {
  lat: number;
  lng: number;
  className?: string;
}

export const AddressDisplay: React.FC<AddressDisplayProps> = ({ lat, lng, className = '' }) => {
  const [address, setAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAddress = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
        const data = await response.json();
        if (data && data.display_name) {
          const parts = data.display_name.split(', ');
          const simplifiedAddress = parts.slice(0, 3).join(', ');
          setAddress(simplifiedAddress);
        } else {
          setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        }
      } catch (error) {
        console.error('Error fetching address:', error);
        setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAddress();
  }, [lat, lng]);

  if (isLoading) {
    return (
      <span className={`inline-flex items-center gap-1 ${className}`}>
        <Loader2 className="h-3 w-3 animate-spin" />
        Mencari lokasi...
      </span>
    );
  }

  return (
    <span className={className} title={`${lat}, ${lng}`}>
      {address}
    </span>
  );
};
