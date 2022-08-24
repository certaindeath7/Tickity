import { useState } from 'react';
import useRequest from '../../hooks/useRequest';
import Router from 'next/router';
import { TextField, Button, Typography, Paper } from '@material-ui/core';
import useStyles from './style';

const Signin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const classes = useStyles();

  // initially, errors will be null
  const { doRequest, errors } = useRequest({
    url: '/api/users/signin',
    method: 'post',
    body: {
      email,
      password,
    },
    onSuccess: () => Router.push('/'),
  });
  const onSubmit = async (e) => {
    e.preventDefault();

    await doRequest();
  };
  return (
    <Paper className={classes.paper}>
      <form
        autoComplete="off"
        noValidate
        className={`${classes.root} ${classes.form}`}
        onSubmit={onSubmit}
      >
        <TextField
          name="email"
          variant="outlined"
          label="Email Address"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <TextField
          name="password"
          variant="outlined"
          label="Password"
          type="password"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          className={classes.buttonSubmit}
          variant="contained"
          color="primary"
          size="large"
          type="sbmit"
          fullWidth
        >
          Submit
        </Button>
      </form>
      {errors}
    </Paper>
  );
};

export default Signin;
