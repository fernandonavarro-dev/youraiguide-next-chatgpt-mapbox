# Your AI Guide

Your AI Guide is a web application that allows users to explore cities and receive personalized recommendations from an AI-powered chatbot, ChatGPT. Whether you're looking for the best restaurants, attractions, or activities, simply specify a location, and ChatGPT will provide you with suggestions tailored to your preferences.

## Features

- Interactive map that dynamically centers on a specified city, zip code, or your current location.
- Integration with ChatGPT to deliver personalized recommendations based on your interests and location.
- Customizable interactive map markers displaying detailed information about recommended places.
- Convenient "My Location" button that allows you to use your current location as the center of the map.
- Ability to place your own pins on the map and attach notes to them. (in development)

## How to Use

### Search by City, State, or Zip Code

1. On the homepage, enter a city name and state, or a zip code in the provided input fields.
2. Click the "Search" button to view the map centered on the specified location.
3. The chat window with ChatGPT will open, prompting you to request recommendations.

### Use Current Location

1. On the homepage, click the "My Location" button to use your current location as the center of the map.
2. The chat window with ChatGPT will open, prompting you to request recommendations.

### Get Recommendations from ChatGPT

1. In the chat window, type your request for recommendations, such as "What are some good restaurants nearby?"
2. ChatGPT will respond with personalized recommendations based on your location and preferences.
3. Recommended places will be marked with pins on the map, and you can click on them to view more information.

### Place Custom Pins with Notes (in development)

1. On the map, you can place your own pins and add notes to them.
2. These custom pins and notes can be saved to a cookie or local storage for future reference.

## Packages and Technologies

- Next.js: The main framework used to build the web application.
- React: Utilized for creating interactive UI components.
- Mapbox GL JS: Employed for rendering interactive maps and reverse geocoding.
- Turf.js: Used to create circular overlay polygons on the map.
- Axios: Enables making HTTP requests to APIs.
- Cheerio: Facilitates scraping data from web pages (in development).
- ChatScope Chat UI Kit: Implemented to create the chat interface with ChatGPT.
- OpenAI GPT-3.5-turbo: The language model that powers ChatGPT.

## Development Setup

To set up the project for local development, follow these steps:

1. Clone the repository to your local machine.
2. Run `npm install` to install the necessary dependencies.
3. Create a `.env.local` file in the root directory and add the required environment variables (e.g., Mapbox access token, OpenAI API key).
4. Run `npm run dev` to start the development server.
5. Open your browser and navigate to `http://localhost:3000` to access the app.

## Contributing

We welcome contributions! If you're interested in contributing to the development of Your AI Guide, please feel free to open a pull request or submit an issue.

## License

Your AI Guide is released under the MIT License.
