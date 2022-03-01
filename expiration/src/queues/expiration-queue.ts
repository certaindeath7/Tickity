import Queue from 'bull';

interface Payload {
  orderId: string;
}
const expirationQueue = new Queue<Payload>('order:expiration', {
  redis: {
    host: process.env.REDIS_HOST,
  },
});

// cosumer job
expirationQueue.process(async (job) => {
  console.log('hello', job.data.orderId);
});

export default expirationQueue;
