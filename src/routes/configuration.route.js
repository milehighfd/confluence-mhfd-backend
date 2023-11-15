import express from 'express';
import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';
import auth from 'bc/auth/auth.js';
import moment from 'moment';

const Configuration = db.configuration;
const router = express.Router();

router.get('/:key', async (req, res) => {
  logger.info(`Starting endpoint configuration.route/:key with params ${JSON.stringify(req.params, null, 2)}`);
  const key = req.params.key;
  logger.info(`Starting function findOne for configuration.route/:key`);
  let configuration = await Configuration.findOne({
    where: {
      key
    }
  });
  logger.info(`Finished function findOne for configuration.route/:key`);
  res.send(configuration);
});

router.put('/:key', async (req, res) => {
  logger.info(`Starting endpoint cardfilters.route/:key with params ${JSON.stringify(req.params, null, 2)}`);
  const key = req.params.key;
  logger.info(`Starting function findOne for configuration.route/:key`);
  let configuration = await Configuration.findOne({
    where: {
      key
    }
  });
  logger.info(`Finished function findOne for configuration.route/:key`);
  logger.info(configuration);
  if (configuration !== null) {
    const value = req.body.value;
    configuration.value = value;
    logger.info(`Starting function save for configuration.route/:key`);
    configuration = await configuration.save();
    const config = await Configuration.findOne({
      where: {
        key
      }
    });
    logger.info(`Finished function save for configuration.route/:key`);
    res.send(config);
  } else {
    res.status(404).send({
      error: 'Configuration not found'
    });
  }
});

const getYearBoardByUser = async (req, res) => {
  const { user } = req;
  const { type } = req.body;
  const associateType = user?.business_associate_contact?.business_address?.business_associate?.code_business_associates_type_id;
  const MHFD_CODE = 6;
  const CONSULTANT_CODE = 2;
  const CONTRACTOR_CODE = 4;
  const LOCAL_GOVERNMENT = 3;
  let key = 'BOARD_YEAR'
  switch (associateType) {
    case MHFD_CODE:
      key = `MHFD_BOARD_YEAR`;
      break;
    case CONSULTANT_CODE || CONTRACTOR_CODE:
      key = `CONS_BOARD_YEAR`;
      break;
    case LOCAL_GOVERNMENT:
      key = `LG_BOARD_YEAR`;
      break;
    default:
      break;
  }
  try {
    let configuration = await Configuration.findAll({
      where: {
        key
      }
    });
    console.log('here', configuration)
    if (configuration.length === 0) {
      res.send({
        error: 'Configuration not found'
      })
    }else{
      res.send(configuration);
    }
  } catch (error) {
    res.status(404).send({
      error: 'Configuration not found'
    });
  }
};

const updateOrCreate = async (req, res) => {
  const { key, value, yearType, typeBoard } = req.body;
  try {
    let configuration = await Configuration.findOne({
      where: {
        key,
        description: yearType,
        type: typeBoard
      }
    });
    const date = moment().format('YYYY-MM-DD HH:mm:ss');
    if (configuration !== null) {
      configuration.value = value;
      configuration.updatedAt = date;
      configuration = await configuration.save();
      res.send(configuration);
    } else {
      const value = req.body.value;
      const lastId = await Configuration.findOne({
        order: [
          ['id', 'DESC']
        ]
      });
      configuration = await Configuration.create({
        key,
        value,
        description: yearType,
        type: typeBoard,
        createdAt: date,
        updatedAt: date,
        id: lastId.id ? lastId.id + 1 : 1
      });
      res.send(configuration);
    }
  } catch (error) {
    console.log(error)
    res.status(404).send({
      error: 'Configuration not found'
    });
  }
};

const getAllYearBoards = async (req, res) => {
  try {
    let configuration = await Configuration.findAll();
    const grouped = configuration.reduce((acc, item) => {
      const key = `${item.type}_${item.description}`;
      if (!acc[key]) {
        acc[key] = { type: item.type, description: item.description, data: [item] };
      } else {
        acc[key].data.push(item);
      }
      return acc;
    }, {});
    const groupedArray = Object.values(grouped);
    res.send(groupedArray)
  } catch (error) {
    res.status(404).send({
      error: 'Configuration not found'
    });
  }
};

router.post('/update-create', auth, updateOrCreate);
router.get('/get/config-user', auth, getYearBoardByUser)
router.get('/get/years', auth, getAllYearBoards);

export default router;
