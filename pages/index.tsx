import { useState, useEffect } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { Listing } from '../scraper';

const Mapbox = dynamic(() => import('../components/Mapbox'), { ssr: false });
const Map = dynamic(() => import('../components/Map'), { ssr: false });

export default function Home() {
  const [zipCode, setZipCode] = useState('');
  const [listings, setListings] = useState<Listing[]>([]);

  const fetchListings = async () => {
    const response = await axios.get<Listing[]>(
      `/api/listings?zipCode=${zipCode}`
    );
    setListings(response.data);
  };

  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZipCode(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchListings();
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <Head>
        <title>Craigslist Housing Map</title>
        <meta name="description" content="Craigslist Housing Map Application" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center">
        <h1 className="text-3xl font-bold">Craigslist Housing Map</h1>

        <form onSubmit={handleSubmit} className="mt-4 flex">
          <label htmlFor="zipCode" className="mr-2">
            Enter zip code:
          </label>
          <input
            type="text"
            id="zipCode"
            name="zipCode"
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
          <Mapbox listings={listings} />
          {/* <Map listings={listings} /> */}
        </div>
      </main>
    </div>
  );
}
