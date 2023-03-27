import { useState, useEffect } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { Listing } from '../scraper';

const Mapbox = dynamic(() => import('../components/Mapbox'), { ssr: false });

export default function Home() {
  const [zipCode, setZipCode] = useState('');
  const [listings, setListings] = useState<Listing[]>([]);
  const [center, setCenter] = useState<[number, number]>([-98.5, 39.8]);
  const [zoom, setZoom] = useState<number>(3.5);
  const [boundingBox, setBoundingBox] = useState<
    [number, number, number, number] | null
  >(null);

  const fetchData = async () => {
    try {
      // Get the bounding box coordinates from OSM
      const osmResponse = await axios.get(
        `https://nominatim.openstreetmap.org/search?postalcode=${zipCode}&country=US&format=json`
      );

      const osmData = osmResponse.data[0];
      if (!osmData) {
        console.log('No location data found for this zip code.');
        return;
      }

      // Set the map center using the bounding box coordinates
      const bbox = osmData.boundingbox.map(parseFloat);
      setBoundingBox(bbox as [number, number, number, number]);
      const lat = (parseFloat(bbox[0]) + parseFloat(bbox[1])) / 2;
      const lon = (parseFloat(bbox[2]) + parseFloat(bbox[3])) / 2;
      setCenter([lon, lat]);
      setZoom(10);

      // Fetch the listings
      const response = await axios.get<Listing[]>(
        `/api/listings?zipCode=${zipCode}`
      );
      console.log('Fetched data:', response.data);
      setListings(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
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
          />
        </div>
      </main>
    </div>
  );
}
