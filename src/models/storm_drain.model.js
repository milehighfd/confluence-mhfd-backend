
export default (sequelize, DataType) => {
  const gradeControlStructure = sequelize.define('GRADE_CONTROL_STRUCTURE', {
    OBJECTID: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    height: {
      type: DataType.INTEGER
    },
    width: {
      type: DataType.INTEGER
    },
    length: {
      type: DataType.INTEGER
    },
    material: {
      type: DataType.STRING
    },
    barrels: {
      type: DataType.INTEGER
    },
    us_end_treatment: {
      type: DataType.STRING
    },
    ds_end_treatment: {
      type: DataType.STRING
    },
    skew: {
      type: DataType.INTEGER
    },
    us_embank_slope: {
      type: DataType.INTEGER
    },
    ds_embank_slope: {
      type: DataType.INTEGER
    },
    description: {
      type: DataType.STRING
    },
    subtype: {
      type: DataType.STRING
    },
    jurisdiction: {
      type: DataType.STRING
    },
    mdp_osp_study_name: {
      type: DataType.STRING
    },
    year_of_study: {
      type: DataType.INTEGER
    },
    year_constructed: {
      type: DataType.INTEGER
    },
    status: {
      type: DataType.STRING
    },
    drainageway: {
      type: DataType.STRING
    },
    reach: {
      type: DataType.STRING
    },
    id: {
      type: DataType.STRING
    },
    checked_by: {
      type: DataType.STRING
    },
    estimated_cost: {
      type: DataType.INTEGER
    },
    station_limits: {
      type: DataType.STRING
    },
    unit_cost: {
      type: DataType.INTEGER
    },
    original_cost: {
      type: DataType.INTEGER
    },
    station_limits_us: {
      type: DataType.STRING
    },
    station_limits_ds: {
      type: DataType.STRING
    },
    current_cost: {
      type: DataType.INTEGER
    },
    mhfdmanager: {
      type: DataType.STRING
    },
    servicearea: {
      type: DataType.STRING
    },
    county: {
      type: DataType.STRING
    },
    problemid: {
      type: DataType.INTEGER
    },
    projectid: {
      type: DataType.INTEGER
    },
    type: {
      type: DataType.STRING
    },
    status2022: {
      type: DataType.STRING
    },
    component_id: {
      type: DataType.INTEGER
    },
    created_user: {
      type: DataType.STRING
    },
    created_date: {
      type: DataType.DATE
    },
    last_edited_user: {
      type: DataType.STRING
    },
    last_edited_date: {
      type: DataType.DATE
    },
    component_type: {
      type: DataType.STRING
    },
    study_id: {
      type: DataType.INTEGER
    },
    original_cost_backup: {
      type: DataType.INTEGER
    },
    Shape: {
      type: DataType.GEOMETRY
    },
    GDB_GEOMATTR_DATA: {
      type: DataType.GEOMETRY
    }
  }, {
    freezeTableName: true,
    tableName: 'GRADE_CONTROL_STRUCTURE',
    createdAt: false,
    updatedAt: false
  });

  return gradeControlStructure;
}