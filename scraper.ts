// scraper.ts
import axios from 'axios';

interface CityData {
  name: string;
  lat: number;
  lon: number;
  boundingBox: [number, number, number, number];
}

async function fetchCityData(searchString: string): Promise<CityData | null> {
  try {
    let query;

    if (searchString.includes(',')) {
      const [city, state] = searchString.split(',').map((str) => str.trim());
      query = `city=${city}&state=${state}&country=US`;
    } else {
      query = `postalcode=${searchString}&country=US`;
    }

    const url = `https://nominatim.openstreetmap.org/search?${query}&format=json`;
    const response = await axios.get(url);

    const osmData = response.data[0];
    if (!osmData) {
      console.log('No location data found.');
      return null;
    }

    const name = osmData.display_name;
    const lat = parseFloat(osmData.lat);
    const lon = parseFloat(osmData.lon);
    const boundingBox = osmData.boundingbox.map(parseFloat) as [
      number,
      number,
      number,
      number
    ];

    return { name, lat, lon, boundingBox };
  } catch (error) {
    console.error(error);
    return null;
  }
}

export { fetchCityData };
export type { CityData };
