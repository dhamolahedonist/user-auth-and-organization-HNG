const { EntitySchema } = require('typeorm');

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
      type: 'one-to-many',
      target: 'User',
      inverseSide: 'organization'
    }
  }
});
