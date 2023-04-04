import { app } from '../app';
import request from 'supertest';
export const signin = async () => {
  const email = 'test@test.com';
  const password = 'password123';
  const response = await request(app)
    .post('/api/users/signup')
    .send({ email: email, password: password })
    .expect(201);
  const cookie = response.get('Set-Cookie');
  return cookie;
};
