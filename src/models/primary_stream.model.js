export default (sequelize, DataType) => {
  const primary_stream = sequelize.define('primary_stream', {
    primary_stream_id: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    project_stream_id: {
      type: DataType.INTEGER
    },
    created_date: {
      type: DataType.DATE
    },
    modified_date: {
      type: DataType.DATE
    },
    last_modified_by: {
      type: DataType.STRING
    },
    created_by: {
      type: DataType.STRING
    },
    is_active: {
      type: DataType.BOOLEAN
    },
    code_data_source_update_type_id: {
      type: DataType.INTEGER
    }
  }, {
    freezeTableName: true,
    tableName: 'primary_stream',
    timestamps: false
  });

  return primary_stream;
}
