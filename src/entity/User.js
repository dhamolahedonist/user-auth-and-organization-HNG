const { EntitySchema } = require('typeorm');
const userValidationSchema = require('../validation/userValidator');
const Organization = require('./Organization');

module.exports = new EntitySchema({
  name: 'User',
  tableName: 'users',
  columns: {
    userId: {
      primary: true,
      type: 'uuid',
      generated: 'uuid'
    },
    firstName: {
      type: 'varchar',
      nullable: false
    },
    lastName: {
      type: 'varchar',
      nullable: false
    },
    email: {
      type: 'varchar',
      unique: true,
      nullable: false
    },
    password: {
      type: 'varchar',
      nullable: false
    },
    phone: {
      type: 'varchar',
      nullable: true
    }
  },
  relations: {
    organization: {
      type: 'many-to-one',
      target: 'Organization',
      joinColumn: true,
      nullable: false
    }
  },
  joiSchema: userValidationSchema, 
});
