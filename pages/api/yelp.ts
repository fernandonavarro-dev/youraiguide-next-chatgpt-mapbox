// /api/yelp.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { location, categories, term } = req.query;

  // Yelp Fusion API endpoint
  const apiUrl = 'https://api.yelp.com/v3/businesses/search';

  // API key obtained from Yelp Fusion
  const apiKey = process.env.YELP_API_KEY;

  try {
    // Build query parameters
    const params = {
      location,
      categories,
      term,
      limit: 10, // Number of recommendations
    };

    // Make a GET request to the Yelp Fusion API
    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      params,
    });

    const data = response.data;

    if (data && data.businesses) {
      // Respond with the list of recommended businesses
      res.status(200).json(data.businesses);
    } else {
      res.status(404).json({ error: 'No recommendations found.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch recommendations.' });
  }
}
