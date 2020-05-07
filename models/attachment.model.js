module.exports = (sequelize, DataType) => {
   const Attachment = sequelize.define('attachment', {
     value: {
       type: DataType.STRING
     },
     projectId: {
       type: DataType.UUID,
       allowNull: false
     }
   });
   return Attachment;
 }