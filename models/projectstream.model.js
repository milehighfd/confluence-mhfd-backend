
module.exports = (sequelize, DataType) => {
  const ProjectStream = sequelize.define('project-stream', {
    _id: {
      type: DataType.UUID,
      defaultValue: DataType.UUIDV4,
      primaryKey: true
    },
    projectid: {
      type: DataType.INTEGER
    },
    mhfd_code: {
      type: DataType.STRING
    }  
  });

  return ProjectStream;
}