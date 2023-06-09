export default (sequelize, DataType) => {
  const Stream = sequelize.define('stream', {
    stream_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    OBJECTID: {
      type: DataType.INTEGER,
      primaryKey: false
    },
    stream_name: {
      type: DataType.STRING,
      allowNull: false
    },
    segment_number: {
      type: DataType.INTEGER,
      primaryKey: false
    }, 
    Reach_Code: {
      type: DataType.STRING,
      allowNull: false
    },
    Trib_Code1: {
      type: DataType.INTEGER,
      primaryKey: false
    }, 
    Trib_Code2: {
      type: DataType.INTEGER,
      primaryKey: false
    },
    Trib_Code3: {
      type: DataType.INTEGER,
      primaryKey: false
    },
    Trib_Code4: {
      type: DataType.INTEGER,
      primaryKey: false
    },
    Trib_Code5: {
      type: DataType.INTEGER,
      primaryKey: false
    },
    Trib_Code6: {
      type: DataType.INTEGER,
      primaryKey: false
    },
    Trib_Code7:{
      type: DataType.INTEGER,
      primaryKey: false
    },
    MHFD_Code: {
      type: DataType.STRING,
      allowNull: false
    },
    legacy_code: {
      type: DataType.STRING,
      allowNull: false
    },
    in_out_district: {
      type: DataType.STRING,
      allowNull: false
    },
    CFS: {
      type: DataType.INTEGER,
      primaryKey: false
    },
    Stress: {
      type: DataType.INTEGER,
      primaryKey: false
    },
    Top_Width: {
      type: DataType.INTEGER,
      primaryKey: false
    },
    Buffer: {
      type: DataType.INTEGER,
      primaryKey: false
    },
    stream_length_miles: {
      type: DataType.INTEGER,
      primaryKey: false
    },
    Enabled: {
      type: DataType.INTEGER,
      primaryKey: false
    },
    in_line_fid: {
      type: DataType.INTEGER,
      primaryKey: false
    },
    SimLnFlag: {
      type: DataType.INTEGER,
      primaryKey: false
    },
    MaxSimpTol: {
      type: DataType.INTEGER,
      primaryKey: false
    },
    MinSimpTol: {
      type: DataType.INTEGER,
      primaryKey: false
    },
    edit_type: {
      type: DataType.STRING,
      allowNull: false
    },
    GlobalID: {
      type: DataType.STRING,
      allowNull: false
    },
    flow_direction: {
      type: DataType.INTEGER,
      primaryKey: false
    },
    created_user: {
      type: DataType.STRING,
      allowNull: false
    },
    created_date: {
      type: DataType.DATE,
      allowNull: false
    },
    last_edited_user: {
      type: DataType.STRING,
      allowNull: false
    },
    major_stream_name: {
      type: DataType.STRING,
      allowNull: false
    },
    last_edited_date: {
      type: DataType.DATE,
      allowNull: false
    },
    Shape: {
      type: DataType.GEOMETRY
    }
  }, {
    freezeTableName: true,
    tableName: 'STREAMS',
    createdAt: false,
    updatedAt: false  
  }
    );
  return Stream;
}
