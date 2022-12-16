import 'bootstrap/dist/css/bootstrap.min.css';
import Header from '../components/Header';
import buildClient from '../api/build-client';

const MyApp = ({ Component, props, currentUser }) => {
  return (
    <>
      <Header currentUser={currentUser}>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Header>
      <div className="container">
        <Component currentUser={currentUser} {...props} />
      </div>
    </>
  );
};

MyApp.getInitialProps = async (appContext) => {
  // appContext.ctx is for indivisual page
  const client = buildClient(appContext.ctx);
  const { data } = await client.get('/api/users/currentuser');
  let props = {};

  // if getInitialProps is defined (from a child component) => fetch some data
  if (appContext.Component.getInitialProps) {
    props = await appContext.Component.getInitialProps(appContext.ctx, client, data.currentUser);
  }

  return {
    props,
    ...data,
  };
};

export default MyApp;
