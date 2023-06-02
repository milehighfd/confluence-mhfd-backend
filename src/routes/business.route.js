import express from 'express';
import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';
import auth from 'bc/auth/auth.js';

const BusinessContact = db.businessAssociateContact;
const BusinessAdress = db.businessAdress;
const BusinessAssociates = db.businessAssociates;
const router = express.Router();

router.get('/business-contact/:id', async (req, res) => {
  logger.info(`Starting endpoint business.route/business-contact/:id with params ${JSON.stringify(req.params, null, 2)}`);
  const id = req.params['id'];
  try {
    logger.info(`Starting function findByPk for business.route/business-contact/:id`);
    const contact = await BusinessContact.findByPk(id, { raw: true });
    logger.info(`Finished function findByPk for business.route/business-contact/:id`);
    if (!contact) {
      res.status(404).send({ error: 'Not Found' });
    }
    res.send(contact);
  } catch (error) {
    logger.error(error);
    res.status(500).send(error);
  }
});

router.get('/business-adress', async (req, res) => {
  logger.info(`Starting endpoint business.route/business-adress with params ${JSON.stringify(req.params, null, 2)}`);
  const id = req.params['id'];
  try {
    logger.info(`Starting function findAll for business.route/business-adress`);
    const contact = await BusinessAdress.findAll();
    logger.info(`Finished function findAll for business.route/business-adress`);
    if (!contact) {
      res.status(404).send({ error: 'Not Found' });
    }
    res.send(contact);
  } catch (error) {
    logger.error(error);
    res.status(500).send(error);
  }
});


router.get('/business-associates', async (_, res) => {
  logger.info(`Starting endpoint business.route/business-associates with params `);
  try {
    logger.info(`Starting function findAll for business.route/business-associates`);
    const associates = await BusinessAssociates.findAll({
      include: [
        {
          model: BusinessAdress,
          require: false,
          include: {
            model: BusinessContact,
            require: false
          }
        }

      ]
    });
    logger.info(`Finished function findAll for business.route/business-associates`);
    res.send(associates);
  } catch(error) {
    res.status(500).send(error);
  }
});

router.post('/business-address-and-contact/:id', [auth], async (req, res) => {
  logger.info(`Starting endpoint business.route/business-address-and-contact/:id with params ${JSON.stringify(req.params, null, 2)}`);
  const id = req.params['id'];
  const user = req.user;
  const { body } = req;
  try {
    const businessAdress = {
      business_associate_id: id,
      business_address_line_1: body.business_address_line_1,
      business_address_line_2: body.business_address_line_2,
      full_address: body.business_address_line_1,
      state: body.state,
      city: body.city,
      zip: body.zip
    };
    logger.info(`Starting function create for business.route/business-associates`);
    const newBusinessAddress = await BusinessAdress.create(businessAdress);
    logger.info(`Finished function create for business.route/business-associates`);
    const businessContact = {
      business_address_id: newBusinessAddress.business_address_id,
      contact_name: body.name,
      contact_email: body.email,
      contact_phone_number: body.phone || 'No number provided'
    };
    const newBusinessContact = await BusinessContact.create(businessContact);
    res.status(201).send({
      businessAdress: newBusinessAddress,
      businessContact: newBusinessContact
    })
  } catch (error) {
    logger.error(error);
    res.status(500).send(error);
  }
});
router.get('/', async (req, res) => {
  logger.info(`Starting endpoint business.route/ with params ${JSON.stringify(req.params, null, 2)}`);
  /*const sa = await ServiceArea.findAll({
    include: { all: true, nested: true }
  }).map(result => result.dataValues).map(res => {
    return {
      ...res,
      Shape:  res.Shape.toString()
    }
  });*/ 
  logger.info(`Starting function query for business.route/`);
  const [sa] = await db.sequelize.query(`SELECT Shape.STEnvelope( ).STAsText() as bbox FROM CODE_SERVICE_AREA`);
  logger.info(`Finished function query for business.route/`);
  console.log(sa);
  res.send(sa);
});

router.get('/sponsor-list', async (req, res) => {
  logger.info(`Starting endpoint business.route/ with params ${JSON.stringify(req.params, null, 2)}`);
  const LOCAL_GOVERNMENT = 3;
  const associates = await BusinessAssociates.findAll({
    attributes: ['business_associates_id', 'business_name'],
    where: {
      code_business_associates_type_id: LOCAL_GOVERNMENT
    },
    order: [['business_name', 'ASC']]
  });
  logger.info(`Finished function findAll for business.route/business-associates`);
  res.send(associates);
});



export default router;
