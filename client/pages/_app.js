import 'bootstrap/dist/css/bootstrap.min.css';
import Header from '../components/Header';
import buildClient from '../api/build-client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider } from '@emotion/react';
import theme from '../src/theme';
import createEmotionCache from '../src/createEmotionCache';

const clientSideEmotionCache = createEmotionCache();

const MyApp = ({ Component, props, currentUser }) => {
  const { emotionCache = clientSideEmotionCache, pageProps } = props;
  return (
    <CacheProvider value={emotionCache}>
      <Header>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Header>
      <ThemeProvider theme={theme}>
        {/* CssBaseline kickstart an elegant, 
                consistent, and simple baseline to
                build upon. */}

        <CssBaseline />
        <Component currentUser={currentUser} {...props} />
      </ThemeProvider>
    </CacheProvider>
  );
};

MyApp.getInitialProps = async (appContext) => {
  const client = buildClient(appContext.ctx);
  const { data } = await client.get('/api/users/currentuser');
  let props = {};

  // if getInitialProps is defined => fetch some data
  if (appContext.Component.getInitialProps) {
    props = await appContext.Component.getInitialProps(appContext.ctx, client, data.currentUser);
  }
  // appContext.ctx is for indivisual page

  // console.log(pageProps);
  return {
    props,
    ...data,
  };
};
export default MyApp;
