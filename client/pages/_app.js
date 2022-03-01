import "bootstrap/dist/css/bootstrap.min.css";
import Header from "../components/Header";
import buildClient from "../api/build-client";
const MyApp = ({ Component, pageProps, currentUser }) => {
  return (
    <div>
      <Header currentUser={currentUser} />
      <Component currentUser={currentUser} {...pageProps} />
    </div>
  );
};

MyApp.getInitialProps = async (appContext) => {
  const client = buildClient(appContext.ctx);
  const { data } = await client.get("/api/users/currentuser");
  let pageProps = {};

  // if getInitialProps is defined => fetch some data
  if (appContext.Component.getInitialProps) {
    pageProps = await appContext.Component.getInitialProps(appContext.ctx);
  }
  // appContext.ctx is for indivisual page

  // console.log(pageProps);
  return {
    pageProps,
    currentUser: data.currentUser,
  };
};
export default MyApp;
