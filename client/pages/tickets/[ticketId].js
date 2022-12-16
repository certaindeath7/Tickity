import useRequest from '../../hooks/useRequest';
import Router from 'next/router';

const ShowTicket = ({ ticket }) => {
  const { doRequest, errors } = useRequest({
    url: '/api/orders/',
    method: 'post',
    body: {
      ticketId: ticket.id,
    },
    onSuccess: (order) => Router.push('/orders/[orderId]', `/orders/${order.id}`),
  });
  return (
    <div>
      <h1>{ticket.title}</h1>
      <h4>Price: {ticket.price}</h4>
      {/* doRequest with () is a reference to doRequest function
      If we had doRequest(), it will call that function right after the page is rendered */}
      <button onClick={doRequest} className="btn btn-primary">
        Purchase
      </button>
    </div>
  );
};

ShowTicket.getInitialProps = async (context, client) => {
  const { ticketId } = context.query;
  const { data } = await client.get(`/api/tickets/${ticketId}`);
  return {
    ticket: data,
  };
};

export default ShowTicket;
