"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _default = function _default(sequelize, DataType) {
  var StateCounty = sequelize.define('CODE_STATE_COUNTY', {
    objectid: {
      type: DataType.INTEGER
    },
    state_county_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    state_id: {
      type: DataType.INTEGER
    },
    fema_dfirm_id: {
      type: DataType.STRING
    },
    census_geoid: {
      type: DataType.STRING
    },
    county_name: {
      type: DataType.STRING
    }
  }, {
    freezeTableName: true,
    tableName: 'CODE_STATE_COUNTY_4326',
    createdAt: false,
    updatedAt: false
  });
  return StateCounty;
};

exports["default"] = _default;