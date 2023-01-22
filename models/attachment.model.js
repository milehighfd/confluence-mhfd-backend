export default (sequelize, DataType) => {
  const Attachment = sequelize.define('project_attachment', {
    project_attachment_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    attachment_url: {
      type: DataType.STRING(512)
    },
    file_name: {
      type: DataType.STRING(512)
    },
    is_cover: {
      type: DataType.INTEGER
    },
    attachment_reference_key: {
      type: DataType.STRING(512)
    },
    attachment_reference_key_type: {
      type: DataType.STRING(512)
    },
    created_by: {
      type: DataType.STRING
    },
    last_modified_by: {
      type: DataType.STRING
    },
    created_date: {
      type: DataType.DATE
    },
    last_modified_date: {
      type: DataType.DATE,
    },
    mime_type: {
      type: DataType.STRING
    },
    project_id: {
      type: DataType.STRING,
      allowNull: true
    }
  }, {
    tableName: 'project_attachment',
    timestamps: false
  });
  return Attachment;
}