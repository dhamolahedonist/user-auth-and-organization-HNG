const { EntitySchema } = require('typeorm');
const organizationValidationSchema = require('../validation/organizationValidator');

module.exports = new EntitySchema({
  name: 'Organization',
  tableName: 'organizations',
  columns: {
    orgId: {
      primary: true,
      type: 'uuid',
      generated: 'uuid'
    },
    name: {
      type: 'varchar',
      nullable: false
    },
    description: {
      type: 'varchar',
      nullable: true
    }
  },
  relations: {
    users: {
      type: 'many-to-many',
      target: 'User',
      joinTable: {
        name: 'user_organizations',
        joinColumn: { name: 'orgId', referencedColumnName: 'orgId' },
        inverseJoinColumn: { name: 'userId', referencedColumnName: 'userId' },
      },
    },
  },
  joiSchema: organizationValidationSchema
});

