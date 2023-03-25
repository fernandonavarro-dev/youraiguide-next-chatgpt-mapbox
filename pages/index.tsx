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

  const fetchListings = async () => {
    const response = await axios.get<Listing[]>(
      `/api/listings?zipCode=${zipCode}`
    );
    console.log('Fetched data:', response.data);
    setListings(response.data);
    if (
      response.data[0] &&
      response.data[0].latitude &&
      response.data[0].longitude
    ) {
      setCenter([response.data[0].longitude, response.data[0].latitude]);
      setZoom(12);
    }
  };

  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZipCode(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchListings();
  };

  return (
    <div className="min-h-screen bg-gray-800 py-6 flex flex-col justify-center sm:py-12">
      <Head>
        <title>Craigslist Housing Map</title>
        <meta name="description" content="Craigslist Housing Map Application" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center">
        <h1 className="text-3xl font-bold text-gray-200">
          Craigslist Rental Housing Map
        </h1>

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

        <div className="mt-8 w-full">
          <Mapbox listings={listings} center={center} zoom={zoom} />
        </div>
      </main>
    </div>
  );
}
