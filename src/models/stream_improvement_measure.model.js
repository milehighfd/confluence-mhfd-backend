
export default (sequelize, DataType) => {
    const streamImprovementMeasure = sequelize.define('STREAM_IMPROVEMENT_MEASURE', {
        OBJECTID: {
          type: DataType.INTEGER,
          primaryKey: true
        },
        component_id: {
          type: DataType.INTEGER
        },
        source_name: {
          type: DataType.STRING
        },
        source_type: {
          type: DataType.STRING
        },
        source_complete_year: {
          type: DataType.INTEGER
        },
        status: {
          type: DataType.STRING
        },
        component_type: {
          type: DataType.STRING
        },
        component_part_category: {
          type: DataType.STRING
        },
        component_part_subcategory: {
          type: DataType.STRING
        },
        bank_location: {
          type: DataType.STRING
        },
        complexity_subtype: {
          type: DataType.STRING
        },
        site_setting: {
          type: DataType.STRING
        },
        existing_channel_presence: {
          type: DataType.STRING
        },
        flow_regime: {
          type: DataType.STRING
        },
        estimated_cost_base: {
          type: DataType.INTEGER
        },
        estimated_cost_current: {
          type: DataType.INTEGER
        },
        cost_adjustment_factor: {
          type: DataType.INTEGER
        },
        mhfd_manager: {
          type: DataType.STRING
        },
        stream_name: {
          type: DataType.STRING
        },
        mhfd_code: {
          type: DataType.STRING
        },
        servicearea: {
          type: DataType.STRING
        },
        county: {
          type: DataType.STRING
        },
        local_government: {
          type: DataType.STRING
        },
        special_district: {
          type: DataType.STRING
        },
        problem_id: {
          type: DataType.INTEGER
        },
        project_id: {
          type: DataType.INTEGER
        },
        study_id: {
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
        conveyance_flag: {
          type: DataType.INTEGER
        },
        project_purpose: {
          type: DataType.STRING
        },
        description: {
          type: DataType.STRING
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
        tableName: 'STREAM_IMPROVEMENT_MEASURE',
        createdAt: false,
        updatedAt: false
      });
    
      return streamImprovementMeasure;
    }