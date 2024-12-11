import supertest from "supertest";
import server from "../server";
import { URL } from "../utilities/constants";

let serverHandle;

beforeAll(() => {
  serverHandle = server.listen(process.env.PORT, () => {
    console.log(`Test server running on port ${process.env.PORT}`);
  });
});

afterAll(() => {
  serverHandle.close();
});

it("Server health Check", async () => {
  const response = await supertest(server).get(`${URL}/healthcheck`);
  console.log('response.status', response.status);
  console.log('response.body', response.body);

  expect(response.status).toEqual(200);
  expect(response.body.success).toEqual(true); // Assuming `success` is part of the response body
  expect(response.body.message).toEqual("Server health is good");
});
