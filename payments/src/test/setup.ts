import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../app';
import request from 'supertest';
import jwt from 'jsonwebtoken';
declare global {
  var signin: (id?: string) => string[];
}
jest.mock('../nats-wrapper');

// function that passed in before will be running before all the tests
// been executed
let mongo: any;
beforeAll(async () => {
  process.env.JWT_KEY = 'ddddd';
  // create an instance of MongoMemoryServer
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  await mongoose.connect(uri);
});

// function to run before each test
beforeEach(async () => {
  jest.clearAllMocks();
  // reach the mongodb database and delete all the data inside
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

// function to run after all the tests been done
afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.signin = (id?: string) => {
  // build a jwt payload {id, email}
  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: 'hello123',
  };

  // create the jwt
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  // build session object {jwt: MY_JWT}
  const session = { jwt: token };

  // turn that session in to JSON
  const sessionJSON = JSON.stringify(session);

  // take JSON and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString('base64');

  // return a string thats the cookie with encoded data
  return [`express:sess=${base64}`];
};
