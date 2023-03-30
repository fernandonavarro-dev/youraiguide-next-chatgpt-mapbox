# Your AI Guide

Your AI Guide is a web application that allows users to explore cities and get personalized recommendations powered by ChatGPT. Simply enter a city name and state, or a zip code, and the app will provide recommendations for food, drinks, sightseeing, and activities within the specified area.

## Features

- Interactive map that centers on the specified city or zip code
- ChatGPT integration to provide personalized recommendations
- Option to view rental listings on Craigslist for the specified area
- Ability for users to place pins with notes on the map, which can be saved to a cookie or local storage
- Interactive map markers displaying relevant information for recommended places
- Option for users to use their current location as the center of the map

## How to Use

### Search by City and State or Zip Code

1. On the homepage, enter a city name and state, or a zip code in the provided input fields.
2. Click the "Search" button to view the map centered on the specified location.
3. The chat window with ChatGPT will open, prompting you to request recommendations.

### Use Current Location

1. On the homepage, click the "My Location" button to use your current location as the center of the map.
2. The chat window with ChatGPT will open, prompting you to request recommendations.

### Get Recommendations

1. In the chat window, type your request for recommendations, such as "What are some good restaurants nearby?"
2. ChatGPT will respond with personalized recommendations based on your location and preferences.
3. Recommended places will be marked with pins on the map, and you can click on them to view more information.

### Place Pins with Notes

1. On the map, you can place your own pins and add notes to them.
2. These pins and notes can be saved to a cookie or local storage for future reference.

## Packages and Technologies

- Next.js: Used as the main framework to build the web application
- React: Used to create interactive UI components
- Mapbox GL JS: Used for rendering interactive maps and reverse geocoding
- Turf.js: Used to create circular overlay polygons on the map
- Axios: Used for making HTTP requests to APIs
- Cheerio: Used to scrape data from web pages (e.g., Craigslist rental listings)
- ChatScope Chat UI Kit: Used to create the chat interface with ChatGPT
- OpenAI GPT-3.5-turbo: Used as the language model to power ChatGPT

## Development Setup

To set up the project for local development, follow these steps:

1. Clone the repository to your local machine
2. Run `npm install` to install the necessary dependencies
3. Create a `.env.local` file in the root directory and add the necessary environment variables (e.g., Mapbox access token, OpenAI API key)
4. Run `npm run dev` to start the development server
5. Open your browser and go to `http://localhost:3000` to access the app

## Contributing

Contributions are welcome! If you'd like to contribute to the development of Your AI Guide, please feel free to open a pull request or submit an issue.

## License

Your AI Guide is released under the MIT License.
