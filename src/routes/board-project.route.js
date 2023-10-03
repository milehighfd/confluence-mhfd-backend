import express from 'express';
import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';
import auth from 'bc/auth/auth.js';
import updateRank from 'bc/routes/board-project/update-rank.js';
import updateCost from 'bc/routes/board-project/cost.js';
import authOnlyEmail from 'bc/auth/auth-only-email.js';

const Board = db.board;
const BoardProject = db.boardProject;
const BoardProjectCost = db.boardProjectCost;
const Project = db.project;
const ProjectCost = db.projectCost;
const ProjectPartner = db.projectPartner;
const CodeProjectPartnerType = db.codeProjectPartnerType;
const BusinessAssociates = db.businessAssociates;
const ProjectIndependentAction = db.projectIndependentAction;

const router = express.Router();

router.get('/:board_project_id/cost', async (req, res) => {
  logger.info('get board project cost by id');
  const { board_project_id } = req.params;
  try {
    const boardProject = await BoardProject.findOne({
      attributes: [
        // 'req1',
        // 'req2',
        // 'req3',
        // 'req4',
        // 'req5',
        'year1',
        'year2'
      ],
      include: [{
        model: Project,
        attributes: ['project_id'],
        as: 'projectData',
        include: [{
          model: ProjectCost,
          attributes: ['cost'],
          as: 'currentCost',
          where: {
            is_active: true
          },
        },
        {
          model: ProjectIndependentAction,
          required: false,
          separate: true,
          attributes: [
            'action_name',
            'project_id',
            'cost',
            'action_status'
          ]
        }]
      }],
      where: {
        board_project_id
      }
    });
    const projectCostValues = await BoardProjectCost.findAll({
      attributes: ['req_position'],
      include: [{
        attributes: ['cost', 'project_cost_id', 'project_partner_id'],
        model: ProjectCost,
        as: 'projectCostData',
        where: {
          is_active: true
        },
        include: [{
          model: ProjectPartner,
          as: 'projectPartnerData',
          include: [{
            model: CodeProjectPartnerType,
            as: 'projectPartnerTypeData'
          }, {
            model: BusinessAssociates,
            as: 'businessAssociateData'
          }]
        }]
      }],
      where: {
        board_project_id
      }
    });
    // console.log('Project Cost', projectCostValues.map((a)=>a.projectCostData));
    console.log("BOARD PROJECT RETURN", boardProject);
    projectCostValues.forEach((projectCostValue) => {
      const pos = projectCostValue.req_position;
      const cost = projectCostValue.projectCostData.cost;
      if( pos > 0) {
        boardProject['req'+pos] = cost;
      }
    });
    return res.status(200).send(boardProject);
  } catch (error) {
    logger.error('ERROR FROM GET COST ' + error);
    return res.status(500).send({ error: error });
  }
});

router.post('/getCostsMaintenance', async (req, res) => {
  const { board_project_id } = req.body;
  try {
    const boardProject = await BoardProject.findAll({
      attributes: [
        'board_project_id',
        'req1',
        'req2',
        'req3',
        'req4',
        'req5',
        'year1',
        'year2'
      ],
      where: {
        board_project_id
      }
    });
    return res.status(200).send(boardProject);
  } catch (error) {
    logger.error('ERROR FROM GET COST ' + error);
    return res.status(500).send({ error: error });
  }
});

router.put('/update-target-cost', [authOnlyEmail], async(req,res) => {
  const {
    boardId,
    targetcost1,
    targetcost2,
    targetcost3,
    targetcost4,
    targetcost5
  } = req.body;
  const {
    locality,
    projecttype,
    type,
    year,
  } = boardId;
  const board = await Board.findOne({
    attributes: ['board_id'],
    where: {
      locality,
      projecttype,
      type,
      year
    },
    sort: [['createdAt', 'DESC']]
  });

  try{
    let boardUpdate = await Board.update(
      {
        targetcost1,
        targetcost2,
        targetcost3,
        targetcost4,
        targetcost5,
        last_modified_by: req.user.email
      },
      {
        where: {
          board_id: board.board_id
        }
      }
    );
    return res.status(200).send(boardUpdate);
  } catch (error) {
    logger.error(error);
    return res.status(500).send({ error: error });
  }
});

router.put('/:board_project_id/update-rank', [auth], updateRank);
router.put('/:board_project_id/cost',[auth], updateCost);

export default router;
