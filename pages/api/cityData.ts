// cityData.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchCityData, CityData } from '../../scraper';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { city, state, zipCode } = req.query;

  if ((!city || !state) && !zipCode) {
    res.status(400).json({ error: 'Invalid or missing parameters.' });
    return;
  }

  try {
    let cityData: CityData | null;
    let searchString: string;

    if (zipCode) {
      searchString = zipCode as string;
    } else {
      searchString = `${city as string}, ${state as string}`;
    }

    cityData = await fetchCityData(searchString);

    if (cityData) {
      res.status(200).json(cityData);
    } else {
      res.status(404).json({ error: 'City data not found.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch city data.' });
  }
}
