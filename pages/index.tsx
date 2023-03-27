import { useState } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import axios from 'axios';
// import { Listing } from '../scraper';
import { CityData } from '../scraper';

const Mapbox = dynamic(() => import('../components/Mapbox'), { ssr: false });

export default function Home() {
  const [cityState, setCityState] = useState('');
  const [zipCode, setZipCode] = useState('');
  // const [listings, setListings] = useState<Listing[]>([]);
  const [center, setCenter] = useState<[number, number]>([-98.5, 39.8]);
  const [zoom, setZoom] = useState<number>(3.5);
  const [boundingBox, setBoundingBox] = useState<
    [number, number, number, number] | null
  >(null);

  const fetchData = async () => {
    try {
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

      // Fetch the city data
      const response = await axios.get<CityData>(`/api/cityData?${apiQuery}`);
      console.log('Fetched data:', response.data);

      const cityData = response.data;
      if (!cityData) {
        console.log('No location data found for this input.');
        return;
      }

      // Set the map center using the bounding box coordinates
      const bbox = cityData.boundingBox;
      setBoundingBox(bbox);
      const lat = (bbox[0] + bbox[1]) / 2;
      const lon = (bbox[2] + bbox[3]) / 2;
      setCenter([lon, lat]);
      setZoom(10);

      // Reset input fields
      setCityState('');
      setZipCode('');
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleCityStateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCityState(e.target.value);
  };

  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZipCode(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  return (
    <div className="min-h-screen bg-gray-800 py-6 flex flex-col justify-start sm:py-12">
      <Head>
        <title>Your AI Guide</title>
        <meta name="description" content="Your AI Guide Web App" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center">
        <h1 className="text-3xl font-bold text-gray-200">Your AI Guide</h1>

        <form onSubmit={handleSubmit} className="mt-4 flex">
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
            className="bg-blue-500 text-white font-bold py-2 px-4 rounded"
          >
            Search
          </button>
        </form>

        <div className="mt-8 w-full px-4">
          <Mapbox
            // listings={listings}
            center={center}
            zoom={zoom}
            boundingBox={boundingBox}
            cityData={null}
          />
        </div>
      </main>
    </div>
  );
}
