export default (sequelize, DataType) => {
  const RelatedStudy = sequelize.define('related_study', {
    related_study_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    study_id: {
      type: DataType.INTEGER
    }
  }, {
    freezeTableName: true,
    tableName: 'related_study'
  });
  return RelatedStudy;
}
