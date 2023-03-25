import React, { useState } from 'react';
import ReactMapGL, { Marker, ViewState } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface Listing {
  latitude?: number;
  longitude?: number;
  // Add other properties as needed
}

interface MapProps {
  listings: Listing[];
}

const Map: React.FC<MapProps> = ({ listings }) => {
  const [viewport, setViewport] = useState<ViewState>({
    latitude: 39.8,
    longitude: -98.5,
    width: '100%',
    height: '500px',
    zoom: 3.5,
  });

  return (
    <ReactMapGL
      {...viewport}
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string}
      mapStyle="mapbox://styles/mapbox/streets-v11"
      onViewStateChange={({ viewState }) => setViewport(viewState)}
    >
      {listings.map(
        (listing, index) =>
          listing.latitude &&
          listing.longitude && (
            <Marker
              key={index}
              latitude={listing.latitude}
              longitude={listing.longitude}
            >
              <div>📍</div>
            </Marker>
          )
      )}
    </ReactMapGL>
  );
};

export default Map;
