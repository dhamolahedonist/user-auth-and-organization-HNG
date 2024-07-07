const { EntitySchema } = require('typeorm');
const userValidationSchema = require('../validation/userValidator');

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
    organizations: {
      type: 'many-to-many',
      target: 'Organization',
      joinTable: {
        name: 'user_organizations',
        joinColumn: { name: 'userId', referencedColumnName: 'userId' },
        inverseJoinColumn: { name: 'orgId', referencedColumnName: 'orgId' },
      },
      cascade: true,
    },
  },
  joiSchema: userValidationSchema,
});
