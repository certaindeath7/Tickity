import { useEffect, useState } from 'react';
import StripeCheckout from 'react-stripe-checkout';
import Router from 'next/router';
import useRequest from '../../hooks/useRequest';

const ShowOrder = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const { doRequest, errors } = useRequest({
    url: '/api/payments',
    method: 'post',
    body: {
      orderId: order.id,
    },
    onSuccess: () => Router.push('/orders'),
  });
  useEffect(() => {
    const findTimeLeft = () => {
      const secondsLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(secondsLeft / 1000));
    };
    findTimeLeft();

    //assign an timer Id to stop the interval once we're about to navigate to another page
    // run findTimeLeft function after 1 second
    const timerId = setInterval(findTimeLeft, 1000);

    return () => {
      //stop the interval, clean up function
      clearInterval(timerId);
    };
  }, [order]);
  if (timeLeft < 0) {
    return <div>Order Expired</div>;
  }
  return (
    <div>
      Time left to pay: {timeLeft} seconds
      <StripeCheckout
        token={(token) => doRequest({ token: token.id })}
        stripeKey={process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY}
        email={currentUser.email}
      />
      {errors}
    </div>
  );
};
ShowOrder.getInitialProps = async (context, client) => {
  const { orderId } = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`);

  return { order: data };
};
export default ShowOrder;
