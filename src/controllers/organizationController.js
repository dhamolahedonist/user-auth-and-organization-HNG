const { Repository } = require('typeorm');
const  AppDataSource = require('../../data-source'); 
const User = require('../entity/User'); 
const Organization = require('../entity/Organization'); 

const getOrganizations = async (req, res) => {
  try {
    // Initialize the data source if it's not already initialized
    if (!AppDataSource.isInitialized) await AppDataSource.initialize();

    const userRepository = AppDataSource.getRepository('User');

    const organizationRepository = AppDataSource.getRepository('Organization');

    // Find the user by ID
    const user = await userRepository.findOne({
       
      where: { userId: req.user.userId },
      relations: ['organization']
    });

    if (!user) {
      return res.status(404).json({
        status: 'Not Found',
        message: 'User not found',
        statusCode: 404,
      });
    }

    // Get the organizations associated with the user
    const organizations = await organizationRepository.find({
      where: { users: user },
      select: ['orgId', 'name', 'description']
    });

    const responseData = {
      status: 'success',
      message: 'Organizations retrieved successfully',
      data: {
        organizations: organizations.map(org => ({
          orgId: org.orgId,
          name: org.name,
          description: org.description
        }))
      }
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};
// const getOrganisationById = async (req, res) => {
    
  
//     try {
//         const orgId = req.params.orgId; // Use orgId parameter
//         const userId = req.user.userId;
//         const userRepository = AppDataSource.getRepository('User');
    
//         const organizationRepository = AppDataSource.getRepository('Organization');
    
//         // Find the user by ID
//         const user = await userRepository.findOne({
//           where: { userId: userId }, // Use id as it matches your user schema
//           relations: ['organization'],
//         });
    
//         if (!user) {
//           return res.status(404).json({
//             status: 'Not Found',
//             message: 'User not found',
//             statusCode: 404,
//           });
//         }
    
//         // Find the organization by orgId
//         const organization = await organizationRepository.findOne({
//             where: { orgId: orgId },
//           });
      
//           if (!organization) {
//             return res.status(404).json({
//               status: 'Not Found',
//               message: 'Organization not found',
//               statusCode: 404,
//             });
//           }
//           const responseData = {
//             status: 'success',
//             message: 'Organization retrieved successfully',
//             data: { organization },
//           };
      
//           res.status(200).json(responseData);
  
//     } catch (error) {
//       console.error('Error:', error);
//       res.status(500).json({
//         status: 'error',
//         message: 'Internal server error',
//       });
//     }
//   };

  const getOrganisationById = async (req, res) => {
    try {
      const orgId = req.params.orgId;
      const userId = req.user.userId;
  
      // Initialize the data source if it's not already initialized
      if (!AppDataSource.isInitialized) await AppDataSource.initialize();
  
      const userRepository = AppDataSource.getRepository('User');
      const organizationRepository = AppDataSource.getRepository('Organization');
  
      // Find the user by ID and include the organization relation
      const user = await userRepository.findOne({
        where: { userId: userId },
        relations: ['organization'],
      });
  
      if (!user) {
        return res.status(404).json({
          status: 'Not Found',
          message: 'User not found',
          statusCode: 404,
        });
      }
  
      // Ensure the user's organization matches the requested orgId
      if (user.organization.orgId !== orgId) {
        return res.status(403).json({
          status: 'Forbidden',
          message: 'Access to the requested organization is forbidden',
          statusCode: 403,
        });
      }
  
      // Find the organization by orgId
      const organization = await organizationRepository.findOne({
        where: { orgId: orgId },
      });
  
      if (!organization) {
        return res.status(404).json({
          status: 'Not Found',
          message: 'Organization not found',
          statusCode: 404,
        });
      }
  
      const responseData = {
        status: 'success',
        message: 'Organization retrieved successfully',
        data: { organization },
      };
  
      res.status(200).json(responseData);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  };
  

module.exports = {
  getOrganizations,
  getOrganisationById
};
