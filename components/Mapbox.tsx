import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface Listing {
  latitude?: number;
  longitude?: number;
  city?: string;
  country?: string;
}

interface MapboxProps {
  listings: Listing[];
  center: [number, number];
  zoom: number;
}

const Mapbox: React.FC<MapboxProps> = ({ listings, center, zoom }) => {
  const mapContainer = useRef<any>(null);
  const map = useRef<mapboxgl.Map | any>(null);
  const [currentStyle, setCurrentStyle] = useState(
    'mapbox://styles/mapbox/streets-v12'
  );

  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? '';

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: currentStyle,
      center: center,
      zoom: zoom,
    });

    const nav = new mapboxgl.NavigationControl();
    map.current.addControl(nav, 'top-right');

    // Add other controls and markers here...

    return () => map.current?.remove();
  }, [listings, center, zoom, currentStyle]);

  const handleStyleChange = (newStyle: string) => {
    setCurrentStyle(`mapbox://styles/mapbox/${newStyle}`);
  };

  return (
    <>
      <div
        ref={mapContainer}
        className="w-full h-[calc(100vh*0.7)] rounded-lg overflow-hidden"
      />

      <div className="menu font-semibold rounded-lg my-1 justify-center">
        <input
          id="streets-v12"
          type="radio"
          name="rtoggle"
          value="streets-v12"
          className="mr-1"
          checked={currentStyle === 'mapbox://styles/mapbox/streets-v12'}
          onChange={() => handleStyleChange('streets-v12')}
        />
        <label htmlFor="streets-v12" className="mr-2">
          streets
        </label>

        <input
          id="light-v11"
          type="radio"
          name="rtoggle"
          value="light-v11"
          className="mr-1"
          checked={currentStyle === 'mapbox://styles/mapbox/light-v11'}
          onChange={() => handleStyleChange('light-v11')}
        />
        <label htmlFor="light-v11" className="mr-2">
          light
        </label>

        <input
          id="dark-v11"
          type="radio"
          name="rtoggle"
          value="dark-v11"
          className="mr-1"
          checked={currentStyle === 'mapbox://styles/mapbox/dark-v11'}
          onChange={() => handleStyleChange('dark-v11')}
        />
        <label htmlFor="dark-v11" className="mr-2">
          dark
        </label>

        <input
          id="satellite-streets-v12"
          type="radio"
          name="rtoggle"
          value="satellite-streets-v12"
          className="mr-1"
          checked={
            currentStyle === 'mapbox://styles/mapbox/satellite-streets-v12'
          }
          onChange={() => handleStyleChange('satellite-streets-v12')}
        />
        <label htmlFor="satellite-streets-v12" className="mr-2">
          satellite streets
        </label>
      </div>
      <style jsx>{`
        .menu {
          position: absolute;
          background: #efefef;
          padding: 10px;
          font-family: 'Open Sans', sans-serif;
          z-index: 1;
        }
      `}</style>
    </>
  );
};

export default Mapbox;
