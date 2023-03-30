import { useState, useRef } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { CityData } from '../scraper';
import ChatGPTAssistant from '@/components/ChatGPTAssistant';
import { formatLocation } from '@/utils/locationFormatter';

const Mapbox = dynamic(import('../components/Mapbox'), { ssr: false });

export default function Home() {
  const [cityState, setCityState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [radius, setRadius] = useState(2.5);
  const [center, setCenter] = useState<[number, number]>([-98.5, 39.8]);
  const [zoom, setZoom] = useState<number>(3.5);
  const [shouldExpand, setShouldExpand] = useState(false);
  const [formattedLocation, setFormattedLocation] = useState('');
  const [recommendations, setRecommendations] = useState<any[]>([]);

  const fetchData = async (apiQuery: string) => {
    try {
      // Build the apiQuery based on the provided parameters
      // let apiQuery;
      if (zipCode) {
        apiQuery = `zipCode=${zipCode}`;
      } else if (cityState) {
        const [city, state] = cityState.split(',').map((s) => s.trim());
        apiQuery = `city=${city}&state=${state}`;
      } else {
        console.log('No valid input provided.');
        return;
      }

      // Fetch the city data
      const response = await axios.get<CityData>(`/api/cityData?${apiQuery}`);
      const cityData = response.data;
      if (!cityData) {
        console.log('No location data found for this input.');
        return;
      }

      setCenter([cityData.lon, cityData.lat]);
      setZoom(getZoomLevelByRadius(radius));
      // setZoom(11);

      // const maxRadius = 2.5;
      // if (radius > maxRadius) {
      //   setRadius(maxRadius);
      // }

      // Reset input fields
      setCityState('');
      setZipCode('');
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const requestLocation = async () => {
    if (!navigator.geolocation) {
      console.log('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Set the map center and circle radius around the user's location
        setCenter([longitude, latitude]);
        setZoom(getZoomLevelByRadius(radius));
        // setRadius(5);
        // setZoom(11);

        // Fetch the city and state data based on user's latitude and longitude
        const reverseGeocodeResponse = await axios.get(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}&types=postcode`
        );
        console.log('reverseGeocodeResponse', reverseGeocodeResponse);

        if (reverseGeocodeResponse.data.features.length > 0) {
          const feature = reverseGeocodeResponse.data.features[0];
          console.log('feature.context', feature.context);
          const cityObj = feature.context[0];
          const stateObj = feature.context[2];
          console.log('cityObj', cityObj);

          if (cityObj && stateObj) {
            const city = cityObj.text;
            const state = stateObj.text;
            // const zipCode = feature.text;

            setCenter([longitude, latitude]);
            // setRadius(5);
            // setZoom(11);

            const locationStr = formatLocation(`${city}, ${state}`, '');
            setFormattedLocation(locationStr);
            console.log('locationStr', locationStr);

            // Call fetchData function with appropriate query parameters
            fetchData(cityState);
            setShouldExpand(true);
          } else {
            console.log('Unable to retrieve location information.');
          }
        } else {
          console.log('Unable to retrieve location information.');
        }
      },
      (error) => {
        console.log('Error fetching geolocation:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  };

  const handleCityStateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCityState(e.target.value);
  };

  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZipCode(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let apiQuery;
    if (zipCode) {
      apiQuery = `zipCode=${zipCode}`;
    } else if (cityState) {
      const [city, state] = cityState.split(',').map((s) => s.trim());
      apiQuery = `city=${city}&state=${state}`;
    } else {
      console.log('No valid input provided.');
      return;
    }
    fetchData(apiQuery);
    setShouldExpand(true);
    setFormattedLocation(formatLocation(cityState, zipCode));
    setZoom(getZoomLevelByRadius(radius));
  };

  const handleRadiusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRadius(parseFloat(e.target.value));
    setZoom(getZoomLevelByRadius(radius));
  };

  const getZoomLevelByRadius = (radius: number) => {
    switch (radius) {
      case 0.5:
        return 14;
      case 1:
        return 13;
      case 2.5:
        return 12;
      case 5:
        return 11;
      default:
        return 12;
    }
  };

  return (
    <div className="min-h-screen bg-gray-800 py-6 flex flex-col justify-start sm:py-12">
      <Head>
        <title>Your AI Guide</title>
        <meta name="Your AI Guide" content="Your AI Guide Web App" />
        <link rel="icon" href="/open-ai-logo.png" />
      </Head>

      <main className="flex flex-col items-center">
        <h1 className="text-3xl font-bold text-gray-200">Your AI Guide</h1>

        <form onSubmit={handleSubmit} className="mt-4 flex">
          <button
            type="button"
            onClick={requestLocation}
            className="bg-green-500 text-white font-bold mr-2 py-2 px-4 rounded ml-2 hover:bg-green-700"
          >
            My Location
          </button>
          <p className="text-gray-200 justify-center items-center text-center mr-2 pt-2">
            or
          </p>
          <input
            type="text"
            id="cityState"
            name="cityState"
            placeholder="Enter city and state"
            value={cityState}
            onChange={handleCityStateChange}
            className="border border-gray-300 p-2 rounded mr-2"
          />
          <p className="text-gray-200 justify-center items-center text-center mr-2 pt-2">
            or
          </p>
          <input
            type="text"
            id="zipCode"
            name="zipCode"
            placeholder="Enter zip code"
            value={zipCode}
            onChange={handleZipCodeChange}
            className="border border-gray-300 p-2 rounded mr-2"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700"
          >
            Search
          </button>
          <div className="pt-0 text-gray-100 justify-center items-center text-xs text-center flex">
            <select
              // type="select"
              value={radius}
              onChange={handleRadiusChange}
              className="bg-gray-200/70 text-black text-center font-semibold ml-2 text-sm py-0 px-1 mr-1 rounded hover:bg-gray-300"
            >
              <option value={0.5}>0.5 miles</option>
              <option value={1}>1 mile</option>
              <option value={2.5}>2.5 miles</option>
              <option value={5}>5 miles</option>
            </select>
            <p>radius</p>
          </div>
        </form>

        <div className="mt-8 w-full px-4">
          <Mapbox
            center={center}
            zoom={zoom}
            radius={radius}
            cityData={null}
            recommendations={recommendations}
          />
        </div>
        <ChatGPTAssistant
          location={formattedLocation}
          shouldExpand={shouldExpand}
          radius={radius}
          setRecommendations={setRecommendations}
        />
      </main>
    </div>
  );
}
