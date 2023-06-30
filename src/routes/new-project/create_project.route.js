import express from 'express';
import Multer from 'multer';
import needle from 'needle';
import projectIndependentActionService from 'bc/services/projectIndependentAction.service.js';
import projectProposedActionService from 'bc/services/projectProposedAction.service.js';
import projectService from 'bc/services/project.service.js';
import attachmentService from 'bc/services/attachment.service.js';
import projectStatusService from 'bc/services/projectStatus.service.js';
import cartoService from 'bc/services/carto.service.js';
import {
  CARTO_URL,
  CREATE_PROJECT_TABLE,
  CREATE_PROJECT_TABLE_V2,
  ARCGIS_SERVICE
} from 'bc/config/config.js';
import db from 'bc/config/db.js';
import auth from 'bc/auth/auth.js';
import logger from 'bc/config/logger.js';
import { addProjectToBoard, cleanStringValue, getLocalitiesNames, updateProjectsInBoard, createLocalitiesBoard } from 'bc/routes/new-project/helper.js';
import moment from 'moment';
import projectPartnerService from 'bc/services/projectPartner.service.js';
import costService from 'bc/services/cost.service.js';

const ProjectLocalGovernment = db.projectLocalGovernment;
const ProjectCounty = db.projectCounty;
const ProjectServiceArea = db.projectServiceArea;
const Project = db.project;
const CodePhaseType = db.codePhaseType;
const CodeCostType = db.codeCostType;

const router = express.Router();
const multer = Multer({
  storage: Multer.MemoryStorage,
  limits: {
    fileSize: 50 * 1024 * 1024
  }
});

class CreateProject {
  constructor(type, body) {
    this.type = type;
    this.body = body;
  }

  insertCommonData() {
    // Insert common data into the main database table
    console.log(`Inserting common data for project '${this.type}' into the main table.`);
  }

  insertSpecificData() {
    throw new Error('insertSpecificData() method must be implemented by the concrete project types.');
  }
}

class TypeCapitalProject extends CreateProject {
  constructor(type) {
    super(type, 'Capital');
  }

  insertSpecificData() {
    // Insert specific data into the second database table
    console.log(`Inserting specific data for project '${this.type}' of type 'Capital' into the second table.`);
  }
}

//functions to create project move to other file
const splitString = (string) => {
  if (typeof string !== 'string') {
    return [];
  }
  return string.split(',');
};

function createProject(type, body) {
  console.log(type)
  switch (type) {
    case 'Capital':
      return new TypeCapitalProject(type,body);
    default:
      throw new Error(`Invalid project type: ${type}`);
  }
}

router.post('/', [auth, multer.array('files')], async (req, res) => {
  try {
    const user = req.user;
    const body = req.body;
    const PROJECT_TYPE = 'Capital';
    const project1 = createProject(PROJECT_TYPE, body);
    project1.insertCommonData();
    project1.insertSpecificData();
    res.status(201).send(PROJECT_TYPE);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});

export default router;

    // year,
    // projectname,
    // description,
    // servicearea,
    // county,
    // jurisdiction,
    // geom,
    // acquisitionprogress,
    // acquisitionanticipateddate,
    // overheadcost,
    // overheadcostdescription,
    // projectsubtype,
    // frequency,
    // maintenanceelegibility,
    // ownership,
    // attachment,
    // ids,
    // sponsor,
    // cosponsor,
    // components,
    // independetComponent,
    // editProject,
    // streams,
    // locality,
    // cover,
    // estimatedcost,
    // studyreason,
    // sendToWR,
    // componentcost,
    // componentcount,,
    // otherReason,
    // isWorkPlan,
    // additionalcost,