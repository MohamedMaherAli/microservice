import Router from 'next/router';
import useRequest from '../../hooks/use-request';
const TicketShow = ({ ticket }) => {
  const { doRequest, errors } = useRequest({
    url: '/api/orders',
    method: 'post',
    body: {
      ticketId: ticket.id,
    },
    onSuccess: (order) => Router.push('/orders/orderId', `/orders/${order.id}`),
  });
  return (
    <>
      <div>Ticket Show</div>
      <h3>{ticket.title}</h3>
      <h4>{ticket.price}</h4>
      <button onClick={() => doRequest()} className='btn btn-primary'>
        Purchase
      </button>
      {errors}
    </>
  );
};

TicketShow.getInitialProps = async (context, client) => {
  const { ticketId } = context.query;
  const { data } = await client.get(`/api/tickets/${ticketId}`);
  return { ticket: data };
};

export default TicketShow;
