import request from 'supertest';
import { app } from '../../app';

const createTicket = () => {
  return request(app).post('/api/tickets').set('Cookie', global.signin()).send({
    title: 'hello',
    price: 20,
  });
};

it('can retrieve created tickets', async () => {
  // since the createTicket returns a Promise, need to put await to wait
  // for the return to be resolved
  await createTicket();

  const response = await request(app).get('/api/tickets').send().expect(200);

  expect(response.body.length).toEqual(1);
});
