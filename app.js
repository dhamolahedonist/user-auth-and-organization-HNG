const express = require("express");
const AppDataSource = require("./data-source");
const {
  createUser,
  loginUser,
  getUserById,
  addUserToOrganisation,
  userRegistration,
} = require("./src/controllers/userController");
const authMiddleware = require("./src/middleware/authMiddleware");
const {
  getOrganizations,
  getOrganisationById,
  createOrganisation,
} = require("./src/controllers/organizationController");
require("dotenv").config();

const app = express();
app.use(express.json());

AppDataSource.initialize()
  .then(() => {
    console.log("Connected to the database");

    app.post("/auth/register", userRegistration);
    app.post("/auth/login", loginUser);
    app.get("/api/users/:id", authMiddleware, getUserById);
    app.get("/api/organisations", authMiddleware, getOrganizations);
    app.get("/api/organisations/:orgId", authMiddleware, getOrganisationById);
    app.post("/api/organisations", authMiddleware, createOrganisation);
    app.post("/api/organisations/:orgId/users", addUserToOrganisation);

    app.get("/", (req, res) => {
      return res.json({
        status: true,
        data: {
          documentationUrl:
            "https://documenter.getpostman.com/view/20062547/2sA3e1BAAt",
        },
      });
    });

    const port = 3000;
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => console.log("Error connecting to the database:", error));

module.exports = app;
