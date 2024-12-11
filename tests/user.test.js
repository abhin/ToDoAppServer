import supertest from "supertest";
import server from "../server";
import mongoose from "mongoose";
import User from "../modals/user";
import { URL } from "../utilities/constants";

let serverInstance;

beforeAll(async () => {
  try {
    await mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log(`DB connected & Server is running...Port: ${process.env.PORT}`);

    serverInstance = server.listen(process.env.PORT, () => {
      console.log(`Test server running on port ${process.env.PORT}`);
    });
  } catch (err) {
    console.log("Database connection error", err);
  }
});

beforeEach(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
  }
  await User.deleteMany();
});

afterAll(async () => {
  await mongoose.connection.close();
  if (serverInstance) {
    serverInstance.close();
  }
});

describe("Signup test cases", () => {
  it("User exists", async () => {
    await supertest(server).post(`${URL}/users/signup`).send({
      name: "Apple",
      email: "suz@gmail.com",
      password: "dhs%7shEr",
    });

    const response = await supertest(server).post(`${URL}/users/signup`).send({
      name: "Apple",
      email: "suz@gmail.com",
      password: "dhs%7shEr",
    });

    expect(response.status).toEqual(400);
    expect(response.body.success).toEqual(false);
    expect(response.body.message).toEqual("User already exists.");
  });

  it("User Creation Error - Simulate DB Disconnection", async () => {
    await mongoose.connection.close();

    const response = await supertest(server).post(`${URL}/users/signup`).send({
      name: "Apple",
      email: "suz@gmail.com",
      password: "dhs%7shEr",
    });

    expect(response.status).toEqual(400);
    expect(response.body.success).toEqual(false);
    expect(response.body.message).toEqual("Client must be connected before running operations");

    await mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
  });

  it("Create User Test", async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
    }

    const response = await supertest(server).post(`${URL}/users/signup`).send({
      name: "Apple",
      email: "suz@gmail.com",
      password: "dhs%7shEr",
      sendEmail: true
    });

    expect(response.status).toEqual(200);
    expect(response.body.success).toEqual(true);
    expect(response.body.message).toEqual(
      "Account is created successfully. Please check your email for the account activation email."
    );
  });
});
