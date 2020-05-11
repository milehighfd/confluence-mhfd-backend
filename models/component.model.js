module.exports = (sequelize, DataType) => {
   const Component = sequelize.define('component', {
      id: {
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
     componentName: {
       type: DataType.STRING
     },
     jurisdiction: {
       type: DataType.STRING
     },
     howCost: {
       type: DataType.FLOAT
     },
     status: {
       type: DataType.STRING
     },
     mitigationType: {
       type: DataType.STRING
     },
     studyName: {
       type: DataType.STRING
     },
     projectId: {
       type: DataType.UUID,
       allowNull: false,
      //  references: {
      //    model: 'Project',
      //    key: 'id'
      //  }
     }
   });
 
   /* Component.associate = models => {
     Component.belongsTo(models.Project);
     {
        allowNull: false
      }
   }; */
   /* Component.associate = models => {
    Component.belongsTo(models.Project, {
      foreignKey: "projectId"
    });
  }; */
 
   return Component;
 }