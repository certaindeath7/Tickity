const Landing = ({ currentUser }) => {
  return currentUser ? <h1>You're signed in</h1> : <h1>Please sign in</h1>;
};

export default Landing;
