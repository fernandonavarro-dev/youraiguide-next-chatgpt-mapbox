import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// interface Listing {
//   latitude?: number;
//   longitude?: number;
//   city?: string;
//   country?: string;
// }

interface MapboxProps {
  //   listings: Listing[];
  center: [number, number];
  zoom: number;
  boundingBox: [number, number, number, number] | null;
}

const Mapbox: React.FC<MapboxProps> = ({
  //   listings,
  center,
  zoom,
  boundingBox,
}) => {
  const mapContainer = useRef<any>(null);
  const map = useRef<mapboxgl.Map | any>(null);
  const [state, setState] = useState({
    currentStyle: 'mapbox://styles/mapbox/streets-v12',
    loaded: false,
  });

  const addBoundingBox = () => {
    if (!map.current || !boundingBox || !state.loaded) return;

    const [minLat, maxLat, minLon, maxLon] = boundingBox;
    const polygon = [
      [minLon, minLat],
      [minLon, maxLat],
      [maxLon, maxLat],
      [maxLon, minLat],
      [minLon, minLat],
    ];

    const boundingBoxSource = {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [polygon],
        },
      },
    };

    if (map.current.getSource('bounding-box')) {
      map.current.getSource('bounding-box').setData(boundingBoxSource.data);
    } else {
      map.current.addSource('bounding-box', boundingBoxSource);

      // Add a fill layer for the bounding box
      map.current.addLayer({
        id: 'bounding-box-fill',
        type: 'fill',
        source: 'bounding-box',
        layout: {},
        paint: {
          'fill-color': '#0080ff',
          'fill-opacity': 0.5,
        },
      });

      // Add an outline layer for the bounding box
      map.current.addLayer({
        id: 'bounding-box-outline',
        type: 'line',
        source: 'bounding-box',
        layout: {},
        paint: {
          'line-color': '#000',
          'line-width': 3,
        },
      });
    }
  };

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

    // Add other controls and markers here...

    return () => map.current?.remove();
  }, [
    // listings,
    center,
    zoom,
    state.currentStyle,
  ]);

  useEffect(() => {
    if (map.current.loaded()) {
      setTimeout(addBoundingBox, 0);
    } else {
      map.current.once('load', addBoundingBox);
    }

    return () => {
      map.current.off('load', addBoundingBox);
    };
  }, [boundingBox, state.loaded, state.currentStyle, addBoundingBox]);

  const handleStyleChange = (newStyle: string) => {
    if (!map.current || !state.loaded) return;

    // Remove the existing layers
    if (map.current.getLayer('bounding-box-fill')) {
      map.current.removeLayer('bounding-box-fill');
    }

    if (map.current.getLayer('bounding-box-outline')) {
      map.current.removeLayer('bounding-box-outline');
    }

    // Remove the existing source
    if (map.current.getSource('bounding-box')) {
      map.current.removeSource('bounding-box');
    }

    // Set the new style
    setState((prevState) => ({
      ...prevState,
      currentStyle: `mapbox://styles/mapbox/${newStyle}`,
    }));

    // Add the layers back
    addBoundingBox();
  };

  useEffect(() => {
    if (!map.current || !state.loaded) return;

    const styleChangeButtons = document.querySelectorAll(
      'input[type="radio"][name="rtoggle"]'
    );
    styleChangeButtons.forEach((button) =>
      button.addEventListener('change', (event: any) => {
        handleStyleChange(event.target.value);
      })
    );

    return () => {
      styleChangeButtons.forEach((button) =>
        button.removeEventListener('change', (event: any) => {
          handleStyleChange(event.target.value);
        })
      );
    };
  }, [state.loaded, state.currentStyle, boundingBox, handleStyleChange]);

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
