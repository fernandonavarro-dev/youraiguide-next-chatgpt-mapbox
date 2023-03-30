import type { AppProps } from 'next/app';
import '../styles/globals.css';
import '../styles/mapbox-gl-controls.css';

const MyApp = ({ Component, pageProps }: AppProps) => {
  return <Component {...pageProps} />;
};

export default MyApp;
