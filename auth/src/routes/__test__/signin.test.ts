import request from 'supertest';
import { app } from '../../app';

it('returns 200 on successful signin', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({ email: 'test@test.com', password: 'password123' })
    .expect(201);

  return request(app)
    .post('/api/users/signin')
    .send({ email: 'test@test.com', password: 'password123' })
    .expect(200);
});

it('returns 400 on fail credentials email or password', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({ email: 'test@test.com', password: 'password123' })
    .expect(201);

  await request(app)
    .post('/api/users/signin')
    .send({ email: 'wrongEmail@test.com', password: 'password123' })
    .expect(400);

  return request(app)
    .post('/api/users/signin')
    .send({ email: 'test@test.com', password: 'wrongPassword' })
    .expect(400);
});

it('gives a cookie on a successful signin', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({ email: 'test@test.com', password: 'password123' })
    .expect(201);
  const response = await request(app)
    .post('/api/users/signin')
    .send({ email: 'test@test.com', password: 'password123' })
    .expect(200);
  expect(response.get('Set-Cookie')).toBeDefined();
});
