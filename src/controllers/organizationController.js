const { Repository } = require("typeorm");
const AppDataSource = require("../../data-source");
const User = require("../entity/User");
const Organization = require("../entity/Organization");
const organizationValidationSchema = require("../validation/organizationValidator");

const createOrganisation = async (req, res) => {
  const { error } = organizationValidationSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    const validationErrors = error.details.map((detail) => ({
      field: detail.context.key,
      message: detail.message,
    }));
    return res.status(400).json({
      status: "Bad Request",
      message: "Client error",
      statusCode: 400,
      errors: validationErrors,
    });
  }
  const { name, description } = req.body;
  const userId = req.user.userId;

  try {
    if (!AppDataSource.isInitialized) await AppDataSource.initialize();
    const organizationRepository = AppDataSource.getRepository("Organization");
    const userRepository = AppDataSource.getRepository("User");

    // Find the user
    const user = await userRepository.findOne({
      where: { userId },
      relations: ["organizations"],
    });

    if (!user) {
      return res.status(404).json({
        status: "Not Found",
        message: "User not found",
        statusCode: 404,
      });
    }

    // Create and save new organization
    const organization = organizationRepository.create({ name, description });
    await organizationRepository.save(organization);

    // Link organization to user
    user.organizations.push(organization);
    await userRepository.save(user);

    const responseData = {
      status: "success",
      message: "Organisation created successfully",
      data: {
        orgId: organization.orgId,
        name: organization.name,
        description: organization.description,
      },
    };

    res.status(201).json(responseData);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

const getOrganizations = async (req, res) => {
  try {
    // Initialize the data source if it's not already initialized
    if (!AppDataSource.isInitialized) await AppDataSource.initialize();

    const userRepository = AppDataSource.getRepository("User");

    // Find the user by ID and load the related organizations
    const user = await userRepository.findOne({
      where: { userId: req.user.userId },
      relations: ["organizations"], // use the correct relation name
    });

    if (!user) {
      return res.status(404).json({
        status: "Not Found",
        message: "User not found",
        statusCode: 404,
      });
    }

    const responseData = {
      status: "success",
      message: "Organisations retrieved successfully",
      data: {
        organizations: user.organizations.map((org) => ({
          orgId: org.orgId,
          name: org.name,
          description: org.description,
        })),
      },
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

const getOrganisationById = async (req, res) => {
  try {
    const orgId = req.params.orgId;
    const userId = req.user.userId;

    // Initialize the data source if it's not already initialized
    if (!AppDataSource.isInitialized) await AppDataSource.initialize();

    const userRepository = AppDataSource.getRepository("User");
    const organizationRepository = AppDataSource.getRepository("Organization");

    // Find the user by ID and include the organizations relation
    const user = await userRepository.findOne({
      where: { userId },
      relations: ["organizations"],
    });

    if (!user) {
      return res.status(404).json({
        status: "Not Found",
        message: "User not found",
        statusCode: 404,
      });
    }

    // Ensure the user is associated with the requested organization
    const organization = user.organizations.find((org) => org.orgId === orgId);

    if (!organization) {
      return res.status(403).json({
        status: "Forbidden",
        message: "Access to the requested organization is forbidden",
        statusCode: 403,
      });
    }

    const responseData = {
      status: "success",
      message: "Organisation retrieved successfully",
      data: { organization },
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

module.exports = {
  getOrganizations,
  getOrganisationById,
  createOrganisation,
};
