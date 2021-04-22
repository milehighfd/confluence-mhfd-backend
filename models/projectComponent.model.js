
module.exports = (sequelize, DataType) => {
  const ProjectComponent = sequelize.define('project-component', {
    _id: {
      type: DataType.UUID,
      defaultValue: DataType.UUIDV4,
      primaryKey: true
    },
    projectid: {
      type: DataType.INTEGER
    },
    objectid: {
      type: DataType.INTEGER
    },
    table: {
      type: DataType.STRING
    }  
  });

  return ProjectComponent;
}
