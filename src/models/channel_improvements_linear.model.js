
export default (sequelize, DataType) => {
  const channelImprovementsLinear = sequelize.define('CHANNEL_IMPROVEMENTS_LINEAR', {
    OBJECTID: {
      type: DataType.INTEGER,
      primaryKey: true
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
    length: {
      type: DataType.INTEGER
    },
    subtype: {
      type: DataType.STRING
    },
    quantity: {
      type: DataType.INTEGER
    },
    unit: {
      type: DataType.STRING
    },
    checked_by: {
      type: DataType.STRING
    },
    description: {
      type: DataType.STRING
    },
    estimated_cost: {
      type: DataType.INTEGER
    },
    // station_limits: {
    //   type: DataType.STRING
    // },
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
    component_id: {
      type: DataType.INTEGER
    },
    GlobalID: {
      type: DataType.STRING
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
    tableName: 'CHANNEL_IMPROVEMENTS_LINEAR',
    createdAt: false,
    updatedAt: false
  });

  return channelImprovementsLinear;
}