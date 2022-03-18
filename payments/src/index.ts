import mongoose from 'mongoose';
import { app } from './app';
import { natsWrapper } from './nats-wrapper';
import { OrderCancelledListener } from './events/listeners/order-cancelled-listener';
import { OrderCreatedListener } from './events/listeners/order-created-listener';
const connectDB = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error('JWT key must be defined');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI key must be defined');
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('NATS_CLIENT_ID key must be defined');
  }
  if (!process.env.NATS_URL) {
    throw new Error('NATS_URL key must be defined');
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('NATS_CLUSTER_ID key must be defined');
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY key must be defined');
  }

  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );
    natsWrapper.client.on('close', () => {
      console.log('connection closed');
      process.exit();
    });
    process.on('SIGINT', () => natsWrapper.client.close()); // close the client first
    process.on('SIGTERM', () => natsWrapper.client.close());

    // adding the nats listener
    new OrderCreatedListener(natsWrapper.client).listen();
    new OrderCancelledListener(natsWrapper.client).listen();

    await mongoose.connect(process.env.MONGO_URI);
    console.log('db connected');
  } catch (error) {
    console.error(error);
  }
};

app.listen(6000, () => {
  console.log('Listening on port 6000!!!!!!');
});

connectDB();
