const { Storage } = require('@google-cloud/storage');
const path = require('path');
const https = require('https');
const { Op } = require("sequelize");
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
  const projects  = await Project.findAll();
  return projects;
}

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
          data['projectType'] = project.projectType;
          data['projectSubtype'] = project.projectSubtype;
          data['requestName'] = project.requestName;
          data['description'] = project.description;
          data['mhfdDollarRequest'] = project.mhfdDollarRequest;
          data['maintenanceEligility'] = project.maintenanceEligility;
          data['maintenanceEligility'] = project.maintenanceEligility;
          break;
        case PROJECT_SUBTYPE.VEGETATION_MANAGEMENT:
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
          data['projectType'] = project.projectType;
          data['projectSubtype'] = project.projectSubtype;
          data['requestName'] = project.requestName;
          data['mhfdDollarRequest'] = project.mhfdDollarRequest;
          data['recurrence'] = project.recurrence;
          data['frecuency'] = project.frecuency;
          data['maintenanceEligility'] = project.maintenanceEligility;
          break;
        case PROJECT_SUBTYPE.MINOR_REPAIRS:
          data['projectType'] = project.projectType;
          data['projectSubtype'] = project.projectSubtype;
          data['requestName'] = project.requestName;
          data['description'] = project.description;
          data['mhfdDollarRequest'] = project.mhfdDollarRequest;
          data['maintenanceEligility'] = project.maintenanceEligility;
          break;
        case PROJECT_SUBTYPE.RESTORATION:
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
        data['projectType'] = project.projectType;
        data['requestName'] = project.requestName;
        data['description'] = project.description;
        data['mhfdDollarRequest'] = project.mhfdDollarRequest;
        data['localDollarsContributed'] = project.localDollarsContributed;
      } else {
        if (project.projectType == PROJECT_TYPE.STUDY) {
          if (project.projectSubType == PROJECT_SUBTYPE.MASTER_PLAN) {
            data['projectType'] = project.projectType;
            data['projectSubtype'] = project.projectSubtype;
            data['requestName'] = project.requestName;
            data['sponsor'] = project.sponsor;
            data['coSponsor'] = project.coSponsor;
            data['requestedStartyear'] = project.requestedStartyear;
            data['goal'] = project.goal;
          } else {
            data['projectType'] = project.projectType;
            data['projectSubtype'] = project.projectSubtype;
            data['requestName'] = project.requestName;
            data['sponsor'] = project.sponsor;
            data['coSponsor'] = project.coSponsor;
            data['requestedStartyear'] = project.requestedStartyear;
          }
        } else {
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

  let data = this.buildJsonData(project);
  data.status = PROJECT_STATUS.DRAFT;
  data.dateCreated = new Date();
  data.priority = PRIORITY.HIGH;
  data.estimatedCost = 0;
  
  if (project.projectType === PROJECT_TYPE.CAPITAL || project.projectType === PROJECT_TYPE.MAINTENANCE) {

    if (project.projectType === PROJECT_TYPE.CAPITAL) {
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
  return data;
}

const filterByFieldDistinct = async (field) => {
  
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