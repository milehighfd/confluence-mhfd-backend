const Project = require('../models/project.model');
const {Storage} = require('@google-cloud/storage');
const path = require('path');
const { PROJECT_STATUS, PROJECT_TYPE, PRIORITY } = require('../lib/enumConstants');
const { STORAGE_NAME, STORAGE_URL } = require('../config/config');

const storage = new Storage({
  keyFilename: path.join(__dirname, '../config/develop-test-271312-20b199f0adbe.json'),
  projectId: 'develop-test-271312'
});

function getPublicUrl (filename) {
  return `${STORAGE_URL}/${STORAGE_NAME}/${filename}`;
}

const filterProject = async (filters) => {
  var query = Project.find();
  for (const key in filters) {
    if (key === 'requestName' && filters[key] != null) {
         query.where(key).equals(new RegExp(filters[key], 'i'));
    } else if ((key == 'estimatedCost' || key == 'mhfdDollarRequest') && filters[key] != null) {
         var initValue = filters[key];
         initValue = initValue.split('[').join("");
         initValue = initValue.split(']').join("");
         const range = initValue.split(",");
         query.find({
            key: {
               "$gte": Number(range[0]),
               "$lt": Number(range[1])
            }
         });
    } else if (key === 'capitalStatus') {
      query.find({ status: filters[key] })
    } else {
      query.where(key).equals(filters[key]);
    }
   }
  query.sort({ "dateCreated": -1 });
  return await query.exec();
}

const saveProject = async (project, files) => {
  project.status = PROJECT_STATUS.DRAFT;
  project.dateCreated = new Date();
  project.priority = PRIORITY.HIGH;
  project.estimatedCost = 0;

  if (project.projectType === PROJECT_TYPE.CAPITAL || project.projectType === PROJECT_TYPE.MAINTENANCE) {
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

module.exports = {
  saveProject,
  filterProject
};