const app = require("../app"); // Adjust path as needed
const { expect } = require("chai");
const chaiHttp = require("chai-http");
const chai = require("chai");
const AppDataSource = require("../data-source");
const { User } = require("../src/entity/User")
const { Organization } = require("../src/entity/Organization");
const { createUser } = require("../src/controllers/userController");

chai.use(chaiHttp);

before(async () => {
  try {
    // Connect to the database before starting the server
    await AppDataSource.initialize();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Error during setup:", error);
    process.exit(1); // Exit with error if setup fails
  }
});

describe("User API", () => {
  // afterEach(async () => {
  //   await User.deleteMany({});
  //   await Organization.deleteMany();
  // });
  it("should register a new user", async () => {
    // Prepare request data
    const userData = {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      password: "password123",
      phone: "08163244111",
    };

    // Log request data before sending
    console.log("Request:", userData);

    // Make POST request to register a new user
    const res = await chai.request(app).post("/auth/register").send(userData);

    // Log response after receiving
    console.log("Response:", res.body);

    // Assertions based on the API response
    expect(res).to.have.status(201);
    expect(res.body).to.have.property("status").equal(true);
    expect(res.body).to.have.property("data");
    expect(res.body.data).to.have.property("accessToken");
    expect(res.body.data).to.have.property("user");
    expect(res.body.data.user).to.have.property("userId");
    expect(res.body.data.user).to.have.property("firstName", "John");
    // Add more assertions as needed
  });
  it.skip("should login successfully", async () => {
    // Prepare request data
    const userData = {
      email: "john.doe@example.com",
      password: "password123",
    };

    // Log request data before sending
    console.log("Request:", userData);

    // Make POST request to register a new user
    const res = await chai.request(app).post("/auth/login").send(userData);

    // Assertions based on the API response
    expect(res).to.have.status(200);
    expect(res.body).to.have.property("status").equal("success");
    expect(res.body).to.have.property("message").equal("Login successful");
    expect(res.body).to.have.property("data");
    expect(res.body.data).to.have.property("accessToken");
    expect(res.body.data).to.have.property("user");
    expect(res.body.data.user).to.have.property("userId");
    expect(res.body.data.user).to.have.property("firstName", "John");
    expect(res.body.data.user).to.have.property("lastName", "Doe");
    expect(res.body.data.user).to.have.property(
      "email",
      "john.doe@example.com"
    );
    expect(res.body.data.user).to.have.property("phone", "08163244111");
    // Add more assertions as needed
  });

  it("should fail if firstName is missing", async () => {
    const userData = {
      lastName: "Doe",
      email: "john.doe@example.com",
      password: "password",
    };

    const res = await chai.request(app).post("/auth/register").send(userData);
    console.log(userData);

    expect(res).to.have.status(422);

    expect(res.body).to.be.an("object");
    expect(res.body.status).to.be.false;
    expect(res.body.errors).to.be.an("array");
    expect(res.body.errors).to.have.lengthOf(1);
    expect(res.body.errors[0].field).to.equal("firstName");
    expect(res.body.errors[0].message).to.equal("First name is required");
  });
  it("should fail if lasttName is missing", async () => {
    const userData = {
      firstName: "sam",
      email: "john.doe@example.com",
      password: "password",
    };

    const res = await chai.request(app).post("/auth/register").send(userData);
    console.log(userData);

    expect(res).to.have.status(422);

    expect(res.body).to.be.an("object");
    expect(res.body.status).to.be.false;
    expect(res.body.errors).to.be.an("array");
    expect(res.body.errors).to.have.lengthOf(1);
    expect(res.body.errors[0].field).to.equal("lastName");
    expect(res.body.errors[0].message).to.equal("Last name is required");
  });
  it("should fail if email is missing", async () => {
    const userData = {
      firstName: "sam",
      lastName: "Doe",
      password: "password",
    };

    const res = await chai.request(app).post("/auth/register").send(userData);
    console.log(userData);

    expect(res).to.have.status(422);

    expect(res.body).to.be.an("object");
    expect(res.body.status).to.be.false;
    expect(res.body.errors).to.be.an("array");
    expect(res.body.errors).to.have.lengthOf(1);
    expect(res.body.errors[0].field).to.equal("email");
    expect(res.body.errors[0].message).to.equal("Email is required");
  });
  it("should fail if password is missing", async () => {
    const userData = {
      firstName: "sam",
      lastName: "Doe",
      email: "john.doe@example.com",
    };

    const res = await chai.request(app).post("/auth/register").send(userData);
    console.log(res.status);
    expect(res).to.have.status(422);
    expect(res.body).to.be.an("object");
    expect(res.body.status).to.be.false;
    expect(res.body.errors).to.be.an("array");
    expect(res.body.errors).to.have.lengthOf(1);
    expect(res.body.errors[0].field).to.equal("password");
    expect(res.body.errors[0].message).to.equal("Password is required");
  });
  it("should fail if email already exists", async () => {
    // Prepare request data
    const userData = {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      password: "password123",
      phone: "08163244111",
    };

    // Log request data before sending
    console.log("Request:", userData);

    // Make POST request to register a new user
    const res = await chai.request(app).post("/auth/register").send(userData);

    // Log response after receiving
    console.log("Response:", res.body);

    // Assertions based on the API response
    expect(res).to.have.status(422); // Expect Unprocessable Entity status
    expect(res.body).to.be.an('object');
    expect(res.body.status).to.be.false;
    expect(res.body.errors).to.be.an('array');
    expect(res.body.errors).to.have.lengthOf(1);
    expect(res.body.errors[0].field).to.equal('email');
    expect(res.body.errors[0].message).to.equal('Email already exists. Please use a different email.');
    // Add more assertions as needed
  });
  it.only('should generate correct default organization name', async () => {
    const userData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123',
      phone: '1234567890',
    };
  
    try {
      // Create user and get response from createUser function
      const response = await createUser(userData);

      // Assert that registration was successful
      expect(response.status).to.be.true;
      expect(response.message).to.equal('Registration successful');
      expect(response.data).to.be.an('object');
      expect(response.data.user).to.be.an('object');

      // Retrieve user from database to verify default organization creation
      const { firstName } = userData;
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { email: userData.email }, relations: ['organizations'] });
      expect(user).to.exist;
      expect(user.organizations).to.be.an('array').that.has.lengthOf(1);

      const organization = user.organizations[0];
      expect(organization).to.exist;
      expect(organization.name).to.equal(`${firstName}'s Organisation`);
      expect(organization.description).to.equal(`Default organization for ${firstName}`);
    } catch (error) {
      console.error('Error in test:', error);
      throw error; // Rethrow the error to fail the test explicitly
    }
  });
});
