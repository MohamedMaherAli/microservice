import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
export const signin = () => {
  // create jwt payload

  // this is total fake values of id and email

  const payload = {
    id: new mongoose.Types.ObjectId().toHexString(),
    email: 'test@test.com',
  };

  //create the jwt
  const token = jwt.sign(payload, process.env.JWT_KEY!);
  const session = { jwt: token };

  //turn token into json
  const sessionJson = JSON.stringify(session);

  //take json and encode it to base64
  const base64 = Buffer.from(sessionJson).toString('base64');

  //return the cookie
  // we put it inside an array because super test expects out cookie to be array
  return [`session=${base64}`];
};
