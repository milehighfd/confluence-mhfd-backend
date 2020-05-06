module.exports = (sequelize, DataType) => {
   const Component = sequelize.define('component', {
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
       allowNull: false
     }
   });
 
   /* Component.associate = models => {
     Component.belongsTo(models.Project, {
       foreignKey: {
         allowNull: false
       }
     });
   }; */
 
   return Component;
 }