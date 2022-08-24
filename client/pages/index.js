import { Typography } from '@material-ui/core';
const Landing = ({ currentUser }) => {
  return currentUser ? (
    <Typography>You're signed in</Typography>
  ) : (
    <Typography>Please sign in</Typography>
  );

  Landing.getInitialProps = async (context, client, currentUser) => {
    return {};
  };
};

export default Landing;
