import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { CityData } from '../scraper';
import * as turf from '@turf/turf';

interface MapboxProps {
  center: [number, number];
  zoom: number;
  radius: number;
  cityData: CityData | null;
  recommendations: any[];
}

const Mapbox: React.FC<MapboxProps> = ({
  center,
  zoom,
  radius,
  recommendations,
}) => {
  const mapContainer = useRef<any>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [markers, setMarkers] = useState<mapboxgl.Marker[]>([]);
  const [state, setState] = useState<{
    currentStyle: string;
    loaded: boolean;
  }>({
    currentStyle: 'mapbox://styles/mapbox/streets-v12',
    loaded: false,
  });

  const addCircle = useCallback(() => {
    if (!map.current || !state.loaded) return;

    const [lon, lat] = center;

    // Create a circle using Turf.js
    const circleFeature = turf.circle([lon, lat], radius, {
      steps: 64,
      units: 'miles',
    });

    const circleSource: mapboxgl.GeoJSONSourceRaw = {
      type: 'geojson',
      data: circleFeature,
    };

    if (map.current.getSource('circle')) {
      (map.current.getSource('circle') as mapboxgl.GeoJSONSource).setData(
        circleSource.data as GeoJSON.FeatureCollection<GeoJSON.Geometry>
      );
    } else {
      // Add the source for the circle
      map.current.addSource('circle', circleSource);

      // Add the circle layer
      map.current.addLayer({
        id: 'circle-fill',
        type: 'fill',
        source: 'circle',
        paint: {
          'fill-color': '#007cbf',
          'fill-opacity': 0.3,
        },
      });
    }
  }, [center, radius, state.loaded]);

  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? '';

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: state.currentStyle,
      center: center,
      zoom: zoom,
    });

    map.current.on('load', () => {
      setState((prevState) => ({ ...prevState, loaded: true }));
    });

    const nav = new mapboxgl.NavigationControl();
    map.current.addControl(nav, 'top-right');

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [center, zoom, state.currentStyle]);

  useEffect(() => {
    if (map.current && map.current.loaded()) {
      setTimeout(addCircle, 0);
    } else {
      map.current?.once('load', addCircle);
    }

    return () => {
      map.current?.off('load', addCircle);
    };
  }, [state.loaded, state.currentStyle, addCircle]);

  const handleStyleChange = useCallback(
    (newStyle: string) => {
      if (!map.current || !state.loaded) return;

      // Remove the existing layers
      if (map.current.getLayer('circle-fill')) {
        map.current.removeLayer('circle-fill');
      }

      // Remove the existing source
      if (map.current.getSource('circle')) {
        map.current.removeSource('circle');
      }

      // Set the new style
      setState((prevState) => ({
        ...prevState,
        currentStyle: `mapbox://styles/mapbox/${newStyle}`,
      }));

      // Add the layers back
      addCircle();
    },
    [addCircle, state.loaded]
  );

  useEffect(() => {
    if (!map.current || !state.loaded) return;

    const styleChangeButtons = document.querySelectorAll(
      'input[type="radio"][name="rtoggle"]'
    );
    styleChangeButtons.forEach((button) =>
      button.addEventListener('change', (event: any) => {
        const newStyle = event.target.value;
        handleStyleChange(newStyle);
      })
    );

    return () => {
      styleChangeButtons.forEach((button) =>
        button.removeEventListener('change', (event: any) => {
          const newStyle = event.target.value;
          handleStyleChange(newStyle);
        })
      );
    };
  }, [state.loaded, handleStyleChange]);

  // Inside the Mapbox component, loop through the recommendations and add markers to the map
  useEffect(() => {
    // Remove any existing markers from the map
    markers.forEach((marker) => marker.remove());

    // Create an array to store new marker instances
    const newMarkers: mapboxgl.Marker[] = [];

    if (map.current && state.loaded && recommendations) {
      console.log('Recommendations:', recommendations);
      recommendations.forEach((recommendation: any, index: number) => {
        if (recommendation.coordinates && map.current) {
          console.log('Calculating distance for:', recommendation);
          // Calculate the distance between the center and the recommendation's coordinates
          const recommendationPoint = turf.point([
            recommendation.coordinates.longitude,
            recommendation.coordinates.latitude,
          ]);
          const centerPoint = turf.point(center);
          const distanceInMiles = turf.distance(
            centerPoint,
            recommendationPoint,
            {
              units: 'miles',
            }
          );

          // Add a marker to the map only if the distance is within the radius
          if (distanceInMiles <= radius) {
            console.log('Distance:', distanceInMiles, 'Radius:', radius);
            // Create a popup with the recommendation's information
            const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
              `<h3>${recommendation.name}</h3>` +
                `<p>${recommendation.address}</p>` +
                `<p>${recommendation.description}</p>`
            );
            // Create a new DOM element to hold the recommendation number
            const markerElem = document.createElement('div');
            markerElem.className = 'recommendation-marker';
            markerElem.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 48" width="36" height="48">
              <path d="M18 0C8.059 0 0 8.059 0 18c0 6.579 3.902 12.254 9.596 15.228L18 48l8.404-14.772C32.098 30.254 36 24.579 36 18 36 8.059 27.941 0 18 0z" fill="#007cbf"/>
              <circle cx="18" cy="18" r="9" fill="white" />
              <text x="18" y="18" text-anchor="middle" fill="black" font-size="14" font-weight="bold" dy=".35em" font-family="Arial, sans-serif">${
                index + 1
              }</text>
            </svg>`;
            console.log(
              'Popup data:',
              recommendation.name,
              recommendation.address,
              recommendation.description
            );
            // Create a marker and attach the popup to it
            const marker = new mapboxgl.Marker(markerElem)
              .setLngLat([
                recommendation.coordinates.longitude,
                recommendation.coordinates.latitude,
              ])
              .setPopup(popup) // Attach the popup to the marker
              .addTo(map.current);

            // Add the marker instance to the newMarkers array
            newMarkers.push(marker);
          }
        }
      });
    }
    // Update the markers state with the new marker instances
    setMarkers(newMarkers);
  }, [state.loaded, recommendations, center, radius]);

  //DON'T ADD IT!

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
          checked={state.currentStyle === 'mapbox://styles/mapbox/streets-v12'}
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
          checked={state.currentStyle === 'mapbox://styles/mapbox/light-v11'}
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
          checked={state.currentStyle === 'mapbox://styles/mapbox/dark-v11'}
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
            state.currentStyle ===
            'mapbox://styles/mapbox/satellite-streets-v12'
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
