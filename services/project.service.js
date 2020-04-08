const Project = require('../models/project.model');
const {Storage} = require('@google-cloud/storage');
const path = require('path');
const { PROJECT_STATUS, PROJECT_TYPE, PRIORITY, FIELDS } = require('../lib/enumConstants');
const { STORAGE_NAME, STORAGE_URL } = require('../config/config');

const storage = new Storage({
  keyFilename: path.join(__dirname, '../config/develop-test-271312-20b199f0adbe.json'),
  projectId: 'develop-test-271312'
});

function getPublicUrl (filename) {
  return `${STORAGE_URL}/${STORAGE_NAME}/${filename}`;
}

const filterProject = async (filters) => {
  let data = {};
  for (const key in filters) {
    if (key === FIELDS.REQUEST_NAME && filters[key] != null) {
      data[key] = new RegExp(filters[key], 'i');
    } else if ((key === FIELDS.ESTIMATED_COST || key === FIELDS.MHFD_DOLLAR_ALLOCATED) && filters[key] != null) {
      let initValue = filters[key];

      initValue = initValue.split('[').join("");
      initValue = initValue.split(']').join("");
      const range = initValue.split(",");
      data[key] = {
        "$gte": +range[0],
        "$lte": +range[1]
      }
    } else if (key === FIELDS.CAPITAL_STATUS) {
      data['status'] = filters[key];
    } else {
      data[key] = filters[key];
    }
  }
  return await Project.find(data).sort({ "dateCreated": -1 });
}

const saveProject = async (project, files) => {
  project.status = PROJECT_STATUS.DRAFT;
  project.dateCreated = new Date();
  project.priority = PRIORITY.HIGH;
  project.estimatedCost = 0;
  console.log(files.length);

  if (project.tasks.length > 0) {
    if (project.tasks[0] !== "") {
      project.tasks = project.tasks[0].split(',');
    }
  }

  if (project.projectType === PROJECT_TYPE.CAPITAL || project.projectType === PROJECT_TYPE.MAINTENANCE) {

    if(project.projectType === PROJECT_TYPE.CAPITAL) {
      console.log(project.components);
      project.components = JSON.parse(project.components);
    }
    const bucket = storage.bucket(STORAGE_NAME);
    const promises = [];

    files.forEach(file => {
      const name = Date.now() + file.originalname;
      const blob = bucket.file(name);
      const newPromise = new Promise((resolve, reject) => {
        blob.createWriteStream({
          metadata: { contentType: file.mimetype}
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
    await project.save();
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

const filterByFieldDistinct = async (field) => {
  console.log(field);
  const data = await Project.collection.distinct(field);
  return data;
}

module.exports = {
  saveProject,
  filterProject,
  userCreators,
  filterByField,
  filterByFieldDistinct
};