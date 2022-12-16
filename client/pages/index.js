import buildClient from '../api/build-client';
import Link from 'next/link';
const Landing = ({ currentUser, tickets }) => {
  console.log(tickets);
  const ticketList = tickets.map((ticket) => {
    return (
      <tr key={ticket.id}>
        <td>{ticket.title}</td>
        <td>{ticket.price}</td>
        <td>
          <Link href="/tickets/[ticketId]" as={`/tickets/${ticket.id}`}>
            <a>View</a>
          </Link>
        </td>
      </tr>
    );
  });
  return (
    <>
      <h1>Tickets</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>{ticketList}</tbody>
      </table>
    </>
  );
};

Landing.getInitialProps = async (context, client, urrentUser) => {
  const { data } = await client.get('/api/tickets');

  return {
    tickets: data,
  };
};

export default Landing;
