import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchListings } from '../../scraper';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { zipCode } = req.query;

  if (!zipCode || typeof zipCode !== 'string') {
    res.status(400).json({ error: 'Invalid or missing zipCode parameter.' });
    return;
  }

  try {
    const listings = await fetchListings(zipCode);
    console.log('Fetched listings:', listings);
    res.status(200).json(listings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch listings.' });
  }
}
