import request from "supertest"; // Correct import statement
import app from "../src/app"; // Adjust the path as needed

describe("Your Test Suite Description", () => {
  it("should describe your test case", async () => {
    const response = await request(app)
      .post("/login")
      .send({
            "email":"nwaforglory6@gmail.com",
            "password":"12345678"
      });

    expect(response.status).toBe(200); // Example assertion, modify as needed
    // Add more assertions or checks as needed
  });
});
