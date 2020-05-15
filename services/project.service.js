const { Storage } = require('@google-cloud/storage');
const path = require('path');
const https = require('https');
const { Op } = require("sequelize");

//const Project = require('../models/project.model');
const db = require('../config/db');
const Project = db.project;
const userService = require('../services/user.service');
const { PROJECT_STATUS, PROJECT_TYPE, PRIORITY, FIELDS } = require('../lib/enumConstants');
const { STORAGE_NAME, STORAGE_URL, CARTO_TOKEN, PROJECT_TABLE } = require('../config/config');

const storage = new Storage({
  keyFilename: path.join(__dirname, '../config/develop-test-271312-20b199f0adbe.json'),
  projectId: 'develop-test-271312'
});

function getPublicUrl(filename) {
  return `${STORAGE_URL}/${STORAGE_NAME}/${filename}`;
}

const filterProject = async (filters) => {
  //console.log(CARTO_TOKEN);// where cartodb_id in (1,2)
  const sql = `SELECT * FROM problems `;
  const URL = `https://denver-mile-high-admin.carto.com/api/v2/sql?q=${sql}&api_key=a53AsTjS8iBMU83uEaj3dw`;
  let result = [];
  https.get(URL, response => {
    console.log('status ' + response.statusCode);
    if (response.statusCode === 200) {
      let str = '';
      response.on('data', function (chunk) {
        str += chunk;
      });
      response.on('end', function () {
        result = JSON.parse(str).rows;
        //console.log('ending', result);
      });
    }
  });
  return await result;
}
/* const filterProject = async (filters, fieldSort, sortType) => {
  let queryObject = {};
  queryObject.where = {};
  for (const key in filters) {
    if (key === FIELDS.REQUEST_NAME && filters[key] != null) { 
      queryObject.where.requestName = {[Op.like]: '%' + filters[key] + '%'}
    } else if ((key === FIELDS.ESTIMATED_COST || key === FIELDS.MHFD_DOLLAR_ALLOCATED) && filters[key] != null) {
      let initValue = filters[key];

      initValue = initValue.split('[').join("");
      initValue = initValue.split(']').join("");
      const range = initValue.split(",");
      //queryObject.where[key] = 
    } else if (key === FIELDS.CAPITAL_STATUS) {
      queryObject.where.status = filters[key]
    } else {
      queryObject.where[key] = filters[key];
    }
  }
  console.log(queryObject);
  return await Project.findAll(queryObject);
} */

const getCollaboratorsByProject = async (user) => {
  let result = [];
  const projects = await Project.find({
    collaborators: { "$in": user._id }
  });
  for (const project of projects) {
    const listCollaborators = [];
    for (const collaborator of project.collaborators) {
      await userService.findById(collaborator).then(
        (user) => {
          listCollaborators.push(user[0]);
        }
      );
    }
    let data = project;
    data.collaborators = listCollaborators;
    result.push(data);
  }

  return result;
}

const buildJsonData = async (project) => {
  let data = {};
  if (project.projectType === PROJECT_TYPE.CAPITAL) {
    // requiredFields = ['requestName', 'description', 'mhfdFundingRequest',
    //   'localDollarsContributed', 'requestFundingYear', 'goal'];
    data['projectType'] = project.projectType;
    data['requestName'] = project.requestName;
    data['description'] = project.description;
    data['mhfdFundingRequest'] = project.mhfdFundingRequest;
    data['localDollarsContributed'] = project.localDollarsContributed;
    data['requestFundingYear'] = project.requestFundingYear;
    data['goal'] = project.goal;

  } else {
    if (project.projectType === PROJECT_TYPE.MAINTENANCE) {
      switch (project.projectSubtype) {
        case PROJECT_SUBTYPE.DEBRIS_MANAGEMENT:
          // requiredFields = ['requestName', 'description', 'mhfdDollarRequest',
          //   'maintenanceEligility', 'frecuency'];
          data['projectType'] = project.projectType;
          data['projectSubtype'] = project.projectSubtype;
          data['requestName'] = project.requestName;
          data['description'] = project.description;
          data['mhfdDollarRequest'] = project.mhfdDollarRequest;
          data['maintenanceEligility'] = project.maintenanceEligility;
          data['maintenanceEligility'] = project.maintenanceEligility;
          break;
        case PROJECT_SUBTYPE.VEGETATION_MANAGEMENT:
          // requiredFields = ['requestName', 'description', 'mhfdDollarRequest',
          //   'recurrence', 'frecuency', 'maintenanceEligility'];
          data['projectType'] = project.projectType;
          data['projectSubtype'] = project.projectSubtype;
          data['requestName'] = project.requestName;
          data['description'] = project.description;
          data['mhfdDollarRequest'] = project.mhfdDollarRequest;
          data['recurrence'] = project.recurrence;
          data['frecuency'] = project.frecuency;
          data['maintenanceEligility'] = project.maintenanceEligility;
          break;
        case PROJECT_SUBTYPE.SEDIMENT_REMOVAL:
          // requiredFields = ['requestName', 'description', 'mhfdDollarRequest',
          //   'recurrence', 'frecuency', 'maintenanceEligility'];
          data['projectType'] = project.projectType;
          data['projectSubtype'] = project.projectSubtype;
          data['requestName'] = project.requestName;
          //data['description'] = project.description;
          data['mhfdDollarRequest'] = project.mhfdDollarRequest;
          data['recurrence'] = project.recurrence;
          data['frecuency'] = project.frecuency;
          data['maintenanceEligility'] = project.maintenanceEligility;
          break;
        case PROJECT_SUBTYPE.MINOR_REPAIRS:
          // requiredFields = ['requestName', 'description', 'mhfdDollarRequest',
          //   'maintenanceEligility'];
          data['projectType'] = project.projectType;
          data['projectSubtype'] = project.projectSubtype;
          data['requestName'] = project.requestName;
          data['description'] = project.description;
          data['mhfdDollarRequest'] = project.mhfdDollarRequest;
          data['maintenanceEligility'] = project.maintenanceEligility;
          break;
        case PROJECT_SUBTYPE.RESTORATION:
          // requiredFields = ['requestName', 'description', 'mhfdDollarRequest',
          //   'maintenanceEligility'];
          data['projectType'] = project.projectType;
          data['projectSubtype'] = project.projectSubtype;
          data['requestName'] = project.requestName;
          data['description'] = project.description;
          data['mhfdDollarRequest'] = project.mhfdDollarRequest;
          data['maintenanceEligility'] = project.maintenanceEligility;
          break;
      }
    } else {
      if (project.projectType === PROJECT_TYPE.PROPERTY_ACQUISITION) {
        // requiredFields = ['requestName', 'description', 'mhfdDollarRequest', 'localDollarsContributed'];
        data['projectType'] = project.projectType;
        data['requestName'] = project.requestName;
        data['description'] = project.description;
        data['mhfdDollarRequest'] = project.mhfdDollarRequest;
        data['localDollarsContributed'] = project.localDollarsContributed;
      } else {
        if (project.projectType == PROJECT_TYPE.STUDY) {
          if (project.projectSubType == PROJECT_SUBTYPE.MASTER_PLAN) {
            // requiredFields = ['requestName', 'sponsor', 'coSponsor', 'requestedStartyear', 'goal'];
            data['projectType'] = project.projectType;
            data['projectSubtype'] = project.projectSubtype;
            data['requestName'] = project.requestName;
            data['sponsor'] = project.sponsor;
            data['coSponsor'] = project.coSponsor;
            data['requestedStartyear'] = project.requestedStartyear;
            data['goal'] = project.goal;
          } else {
            // requiredFields = ['requestName', 'sponsor', 'coSponsor', 'requestedStartyear'];
            data['projectType'] = project.projectType;
            data['projectSubtype'] = project.projectSubtype;
            data['requestName'] = project.requestName;
            data['sponsor'] = project.sponsor;
            data['coSponsor'] = project.coSponsor;
            data['requestedStartyear'] = project.requestedStartyear;
          }
        } else {
          // requiredFields = ['requestName', 'description'];
          data['projectType'] = project.projectType;
          data['requestName'] = project.requestName;
          data['description'] = project.description;
        }
      }
    }
  }

  return data;
}

const saveProject = async (project, files) => {

  // project.status = PROJECT_STATUS.DRAFT;
  // project.dateCreated = new Date();
  // project.priority = PRIORITY.HIGH;
  // project.estimatedCost = 0;
  let data = this.buildJsonData(project);
  data.status = PROJECT_STATUS.DRAFT;
  data.dateCreated = new Date();
  data.priority = PRIORITY.HIGH;
  data.estimatedCost = 0;
  console.log('log', data);
  //project.collaborators = project.creator;
  //console.log('project ', project);

  /* if (project.tasks.length > 0) {
    if (project.tasks[0] !== "") {
      project.tasks = project.tasks[0].split(',');
    }
  } */

  if (project.projectType === PROJECT_TYPE.CAPITAL || project.projectType === PROJECT_TYPE.MAINTENANCE) {

    if (project.projectType === PROJECT_TYPE.CAPITAL) {
      //console.log(project.components);
      project.components = JSON.parse(project.components);
    }
    const bucket = storage.bucket(STORAGE_NAME);
    const promises = [];

    files.forEach(file => {
      const name = Date.now() + file.originalname;
      const blob = bucket.file(name);
      const newPromise = new Promise((resolve, reject) => {
        blob.createWriteStream({
          metadata: { contentType: file.mimetype }
        }).on('finish', async response => {
          await blob.makePublic();
          resolve(getPublicUrl(name));
        }).on('error', err => {
          reject('upload error: ', err);
        }).end(file.buffer);
      });
      promises.push(newPromise);
    });
    Promise.all(promises).then(async response => {
      project.mainImage = response[0];
      project.attachList = response.slice(1);
      await project.save();
      return project;
    }).catch((err) => {
      throw new Error({
        error: err.message
      });
    });
  } else {
    Project.create(project);
    //await project.save();
    return project;
  }
}

const userCreators = async () => {
  const users = await Project.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "creator",
        foreignField: "_id",
        as: "users"
      }
    },
    {
      $group: {
        _id: "$users"
      }
    }
  ]);
  return users;
}

const filterByField = async (field) => {
  const data = await Project.aggregate([
    {
      $group: {
        _id: "$" + field
      }
    }
  ]);
  return data;
}

const counterProjectByCreator = async (creator) => {
  const data = await Project.findAll();
  /*
  {
    attributes: ['projectType', sequelize.fn('count', sequelize.col('projectType'))
    ],
    group: ['Project.projectType']
  }*/
  //console.log(data);
  /* const data = await Project.aggregate([
    {
      $match : {"creator": creator._id}
    },
    {
      $group : {
        _id: '$projectType',
        count: { $sum: 1}
      }
    }
  ]); */
  return data;
}

const filterByFieldDistinct = async (field) => {
  console.log(field);
  const data = await Project.collection.distinct(field);
  return data;
}

const findAll = () => {
  const projects = Project.findAll();
  return projects;
}

module.exports = {
  saveProject,
  filterProject,
  userCreators,
  filterByField,
  filterByFieldDistinct,
  counterProjectByCreator,
  getCollaboratorsByProject,
  findAll
};