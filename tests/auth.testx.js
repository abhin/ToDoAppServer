import supertest from "supertest";
import mongoose from "mongoose";
import User from "../modals/user";
import server from "../server";
import { URL } from "../utilities/constants";

beforeAll(async () => {
  
});

beforeEach(() => {
  User.deleteMany();
});

describe("Signup test cases", () => {
  it("Login Test", async () => {
    // const response = await supertest(server).post(`${URL}/auth/login`);
    console.log('test success');
  });
});
