import axios from 'axios';
import cheerio from 'cheerio';

interface Listing {
  title: string;
  price: string;
  url: string;
  latitude?: number;
  longitude?: number;
}

async function fetchListings(zipCode: string): Promise<Listing[]> {
  try {
    const url = `https://www.craigslist.org/search/apa?search_distance=5&postal=${zipCode}`;
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const listings: Listing[] = [];

    $('.result-row').each((index, element) => {
      const title = $(element).find('.result-title').text();
      const price = $(element).find('.result-price').text();
      const url = $(element).find('a').attr('href') || '';

      const latitude = parseFloat($(element).attr('data-latitude') || '');
      const longitude = parseFloat($(element).attr('data-longitude') || '');

      listings.push({ title, price, url, latitude, longitude });
    });

    return listings;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export { fetchListings, type Listing };
