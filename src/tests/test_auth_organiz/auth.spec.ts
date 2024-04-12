import app from '../../app';
import * as db  from '../db';
import supertest from 'supertest'
const request = supertest(app)
import { faker } from '@faker-js/faker';


beforeAll(async () => {
   await db.connect()
});
afterEach(async () => {
   await db.clearDatabase()
});
afterAll(async () => {
   await db.closeDatabase()
});

let dummy_user = {
    "website":"wwww.html.com",
    "email":"nwaforglory6@gmail.com",
    "phone":"1234567",
    "bizType":"trading",
    "yearOfEstablishment":"2020-11-12",
    "referalCode":"2345",
    "nameOfEstablishment":"yamltech",
    "nameOfProprietor":"Glory",
    "businessAddress":"lagos",
    "personalAddress":"mowe",
    "opLicenceImage":"65e60a528d90033f82c223d9",
    "cacImage":"65e60ad9879a426ce9b5a4bb",
    "password":"12345678"
  }

describe('Test onboard orgainzation', () => {
   
   test('POST - /', async () => {
      const res = await request.POST('/').send(

      );
      const body = res.body;
      const message = body.message;
      expect(res.statusCode).toBe(200);
      expect(message).toBe('welcome to express and typescript');
   });
})
