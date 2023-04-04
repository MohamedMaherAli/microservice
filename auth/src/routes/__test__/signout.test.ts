import request from 'supertest';
import { app } from '../../app';

it('clears the cookie after signout', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({ email: 'test@test.com', password: 'password123' })
    .expect(201);
  const respnse = await request(app)
    .post('/api/users/signout')
    .send({})
    .expect(200);
  console.log(respnse.get('Set-Cookie'));
  expect(respnse.get('Set-Cookie')[0]).toEqual(
    'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly'
  );
});
