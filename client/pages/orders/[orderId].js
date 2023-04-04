import { useEffect, useState } from 'react';
import StripeCheckout from 'react-stripe-checkout';
import useRequest from '../../hooks/use-request';
import Router from 'next/router';

const OrderShow = ({ order, currentUser }) => {
  const [remainingTime, setRemainingTime] = useState(0);
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
      const msLeft = new Date(order.expiresAt) - new Date();
      setRemainingTime(Math.round(msLeft / 1000));
    };
    findTimeLeft();
    const timerId = setInterval(findTimeLeft, 1000);
    return () => {
      clearInterval(timerId);
    };
  }, []);
  return (
    <>
      <h1>Order Show</h1>
      {remainingTime < 0 ? (
        <h3>order expired</h3>
      ) : (
        <>
          <h5>Time elft to purchase: {remainingTime} seconds</h5>
          <StripeCheckout
            token={({ id }) => doRequest({ token: id })}
            stripeKey='pk_test_51MrqtAI1Vr0KLCP5EQvxu7HsHYClbBFbR09HrduaCQZbc38kKvNFk1mKqUYkmpvZnRyrXc4fbxwEUuUQiyGIvq7K00hD32ry18'
            amount={order.ticket.price * 100}
            email={currentUser.email}
          />
        </>
      )}
      {errors}
    </>
  );
};

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`);
  return { order: data };
};

export default OrderShow;
