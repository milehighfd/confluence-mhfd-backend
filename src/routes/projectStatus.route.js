import express from 'express';
import sequelize from 'sequelize';
import logger from 'bc/config/logger.js';
import db from 'bc/config/db.js';
import auth from "bc/auth/auth.js";
import projectService from 'bc/services/project.service.js';

const router = express.Router();
const Project = db.project;
const ProjectStatus = db.projectStatus;
const CodePhaseType = db.codePhaseType;
const Op = sequelize.Op;

router.put('/update-group', [auth], async (req, res) => {
  logger.info(`Starting endpoint projectStatus.route/ with params ${JSON.stringify(req.params, null, 2)}`);
  const { phases } = req.body;
  const { email } = req.user;
  try {
    const updates = [];
    for (const element of phases) {
      element.modified_date = new Date();
      element.last_modified_by = email;
      if (element.current) {
        Project.update({ current_project_status_id: element.project_status_id }, {
          where: {
            project_id: element.project_id
          }
        });
      }
      updates.push(ProjectStatus.update(element, {
        where: {
          project_status_id: element.project_status_id
        }
      }));
    }
    logger.info(`Starting function all for  projectStatus.route/`);
    const answer = await Promise.all(updates);
    logger.info(`Finished function all for  projectStatus.route/`);
    res.send(answer);
  } catch(error) {
    logger.error(error);
    return res.status(500).send(error);
  }
});

router.post('/create-group', [auth], async (req, res) => {
  logger.info(`Starting endpoint projectStatus.route/create-group with params ${JSON.stringify(req.params, null, 2)}`);
  const { project_id, phases } = req.body;
  const { email } = req.user;
  try {
    /*
    const phases = await CodePhaseType.findAll({
      where: {
        code_project_type_id
      }
    }).map(result => result.dataValues);
    */
    const groups = [];
    let currentIndex = -1;
    for (const [index, element] of phases.entries()) {      
      const newStatus = {
        project_id,
        code_phase_type_id: element.phase_id,
        created_by: email,
        phase_change_date: new Date(),
        created_date: new Date(),
        modified_date: new Date(),
        planned_start_date: element.from,
        planned_end_date: element.to,
        actual_start_date: element.from,
        actual_end_date: element.to,
        duration: element.duration,
        is_locked:element.locked,
        last_modified_by: email
      }
      if (element.current) {
        currentIndex = index; 
      }
      logger.info(`Starting function findOne for projectStatus.route/create-group`);
      const hasStatus = await ProjectStatus.findOne({
        where: {
          project_id,
          code_phase_type_id: element.phase_id,
        }
      });
      logger.info(`Finished function findOne for projectStatus.route/create-group`);
      if (hasStatus) {
        groups.push(ProjectStatus.update(newStatus, {
          where: {
            project_id,
            code_phase_type_id: element.phase_id,
          }
        }).then(() => {
          return ProjectStatus.findOne({
            where: {
              project_id,
              code_phase_type_id: element.phase_id,
            }
          })
        }));  
      } else {
        groups.push(ProjectStatus.create(newStatus));
      }
    }
    logger.info(`Starting function all for projectStatus.route/create-group`);
    const answer = await Promise.all(groups);
    logger.info(`Finished function all for projectStatus.route/create-group`);
    if (currentIndex !== -1) {
      logger.info(`Starting function findByPk for projectStatus.route/create-group`);
      const update = await Project.findByPk(project_id, { raw: true });
      logger.info(`Finished function findByPk for  projectStatus.route/create-group`);
      logger.info(JSON.stringify(update));
      if (update) {
        update.current_project_status_id = answer[currentIndex].project_status_id;
        logger.info(`Starting function update for projectStatus.route/create-group`);
        await Project.update(update, {
          where: {
            project_id: project_id
          }
        });
        logger.info(`Finished function update for projectStatus.route/create-group`);
      }
      projectService.updateProjectCurrentProjectStatusId(project_id, answer[currentIndex].project_status_id);
    }
    logger.info(`Starting function updateProjectStatus for projectStatus.route/create-group`);
    await projectService.updateProjectStatus(project_id);
    res.status(201).send(answer);
    logger.info(`Finished function updateProjectStatus for projectStatus.route/create-group`);
  } catch (error) {
    logger.error(`Error creating the group of statuses: ${error}`);
    res.status(500).send(error);
  }
  // code_phase_type  
});


router.post('/', async (req, res) => {
  logger.info(`Starting endpoint projectStatus.route/ with params ${JSON.stringify(req.params, null, 2)}`);
  const code_phase_type_id = req.body.code_phase_type_id;
  const project_id = req.body.project_id;
  try {
    logger.info(`Starting function findAll for projectStatus.route/`);
    const list = await ProjectStatus.findAll({      
      where: {
        code_phase_type_id: code_phase_type_id,
        project_id: project_id
      },
    });
    logger.info(`Finished function findAll for projectStatus.route/`);
    return res.send(list);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});


router.put('/comment', async (req, res) => {
  logger.info(`Starting endpoint projectStatus.route/comment with params ${JSON.stringify(req.params, null, 2)}`);
  const code_phase_type_id = req.body.code_phase_type_id;
  const project_id = req.body.project_id;
  const comment = req.body.comment;
  try {
    logger.info(`Starting function update for projectStatus.route/comment`);
    const result = await ProjectStatus.update(
      {
        comment: comment,
      },
      {
        where: {
          project_id: project_id,
          code_phase_type_id: code_phase_type_id,
        },
      }
    );
    logger.info(`Finished function update for projectStatus.route/comment`);
    return res.send(result);
  } catch (error) {
    return res.status(500).send(error);
  }
  ``;
});

router.put('/', async (req, res) => {
  logger.info(`Starting endpoint projectStatus.route/ with params ${JSON.stringify(req.params, null, 2)}`);
  const code_phase_type_id = req.body.code_phase_type_id;
  const project_id = req.body.project_id;
  const comment = req.body.comment;
  const actual_start_date = req.body.actual_start_date;
  const actual_end_date = req.body.actual_end_date;
  try {
    logger.info(`Starting function update for projectStatus.route/`);
    const result = await ProjectStatus.update(
      {
        comment: comment,
        actual_start_date: actual_start_date,
        actual_end_date: actual_end_date,
      },
      {
        where: {
          project_id: project_id,
          code_phase_type_id: code_phase_type_id,
        },
      }
    );
    logger.info(`Finished function update for projectStatus.route/`);
    return res.send(result);
  } catch (error) {
    return res.status(500).send(error);
  }
});

router.get('/', async (req, res) => { 
  logger.info(`Starting endpoint projectStatus.route/ with params ${JSON.stringify(req.params, null, 2)}`);
  try {
    logger.info(`Starting function findAll for projectStatus.route/`);
    const list = await ProjectStatus.findAll();
    logger.info(`Finished function findAll for projectStatus.route/`);
    return res.send(list);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});


export default router;
