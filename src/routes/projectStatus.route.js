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

router.post('/create-group', [auth], async (req, res) => {
  const { project_id, phases } = req.body;
  const { name } = req.user;
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
      console.log(element);
      const newStatus = {
        project_id,
        code_phase_type_id: element.code_phase_type_id,
        created_by: name,
        phase_change_date: new Date(),
        created_date: new Date(),
        modified_date: new Date(),
        planned_start_date: element.startDate,
        planned_end_date: element.endDate,
        actual_start_date: element.startDate,
        actual_end_date: element.endDate,
        duration: element.duration,
        last_modified_by: name
      }
      if (element.current) {
        currentIndex = index; 
      }
      const hasStatus = await ProjectStatus.findOne({
        where: {
          project_id,
          code_phase_type_id: element.code_phase_type_id,
        }
      });
      if (hasStatus) {
        groups.push(hasStatus);
      } else {
        groups.push(ProjectStatus.create(newStatus));
      }
    }
    const answer = await Promise.all(groups);
    if (currentIndex !== -1) {
      const update = await Project.findByPk(project_id, { raw: true });
      logger.info(JSON.stringify(update));
      if (update) {
        update.current_project_status_id = answer[currentIndex].project_status_id;
        await Project.update(update, {
          where: {
            project_id: project_id
          }
        });
      }
      projectService.updateProjectCurrentProjectStatusId(project_id, answer[currentIndex].project_status_id);
    }
    await projectService.updateProjectStatus(project_id);
    res.status(201).send(answer);
  } catch (error) {
    logger.error(`Error creating the group of statuses: ${error}`);
    res.status(500).send(error);
  }
  // code_phase_type  
});

router.post('/', async (req, res) => {
  const code_phase_type_id = req.body.code_phase_type_id;
  const project_id = req.body.project_id;
  try {
    const list = await ProjectStatus.findAll({      
      where: {
        code_phase_type_id: code_phase_type_id,
        project_id: project_id
      },
    });
    return res.send(list);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

router.put('/', async (req, res) => {
  const code_phase_type_id = req.body.code_phase_type_id;
  const project_id = req.body.project_id;
  const comment = req.body.comment;
  const actual_start_date = req.body.actual_start_date;
  const actual_end_date = req.body.actual_end_date;
  console.log(comment)
  try {
    const result = await ProjectStatus.update(
      { comment: comment, actual_start_date: actual_start_date, actual_end_date: actual_end_date },
      { where: { project_id: project_id, code_phase_type_id: code_phase_type_id } }
    )
    return res.send(result);
  } catch (error) {
    return res.status(500).send(error);
  }
});

router.get('/', async (req, res) => { 
  try {
    const list = await ProjectStatus.findAll();
    return res.send(list);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});


export default router;
