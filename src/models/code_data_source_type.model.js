export default  (sequelize, DataType) => {
  const CodeDataSourceType = sequelize.define('code_data_source_type', {
    code_data_source_type_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    update_source: {
      type: DataType.STRING,
    },    
    created_date: {
      type: DataType.DATE,
    },
    created_by: {
      type: DataType.STRING,
    },
    last_modified_date: {
      type: DataType.DATE,
    },
    last_update_by: {
      type: DataType.STRING,
    }
  }, {
    freezeTableName: true,
    tableName: 'code_data_source_type',
    createdAt: false,
    updatedAt: false
  });
  return CodeDataSourceType;
}
