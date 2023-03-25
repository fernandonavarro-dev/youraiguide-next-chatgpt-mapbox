import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface Listing {
  latitude?: number;
  longitude?: number;
  // Add other properties as needed
}

interface MapboxProps {
  listings: Listing[];
}

const Mapbox: React.FC<MapboxProps> = ({ listings }) => {
  const mapContainer = useRef<any>(null);
  const map = useRef<mapboxgl.Map | any>(null);

  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? '';

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-98.5, 39.8],
      zoom: 3.5,
    });

    map.current.on('load', () => {
      listings.forEach((listing) => {
        if (listing.latitude && listing.longitude) {
          new mapboxgl.Marker()
            .setLngLat([listing.longitude, listing.latitude])
            .addTo(map.current);
        }
      });
    });

    return () => map.current?.remove();
  }, [listings]);

  return (
    <div
      ref={mapContainer}
      className="w-full h-96 rounded-lg overflow-hidden"
    />
  );
};

export default Mapbox;
