module.exports = (sequelize, DataType) => {
   const Attachment = sequelize.define('attachment', {
     name: {
       type: DataType.STRING
     },
     projectId: {
       type: DataType.UUID,
       allowNull: false
     }
   });
   return Attachment;
 }