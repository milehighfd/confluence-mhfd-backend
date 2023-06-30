import express from 'express';
import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';
import auth from 'bc/auth/auth.js';

const BusinessContact = db.businessAssociateContact;
const BusinessAdress = db.businessAdress;
const BusinessAssociates = db.businessAssociates;

const User = db.user;
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
    res.send(associates.map(element => element.dataValues)
      .filter(d => d.code_business_associates_type_id !== 8 && d.code_business_associates_type_id !== 9));
  } catch(error) {
    res.status(500).send(error);
  }
});

router.post('/business-address/:idcontact', [auth], async (req, res) => {
  const id = req.params['idcontact'];
  const { body } = req;
  const t = await db.sequelize.transaction();
  try {
    let newBusinessAddress;
    const businessAdress = {
      business_associate_id: body.business_associate_contact_id,
      business_address_line_1: body.business_address_line_1,
      business_address_line_2: body.business_address_line_1,
      full_address: body.business_address_line_1,
      state: body.state,
      city: body.city.substring(0, 25),
      zip: body.zip
    };    
    newBusinessAddress = await BusinessAdress.create(businessAdress, { transaction: t });
    const businessContact = {
      business_address_id : newBusinessAddress.business_address_id,
      contact_name: body.contact_name,
      contact_email: body.contact_email,
      contact_phone_number: body.contact_phone_number,
    };
    const updateBusinessContact = await BusinessContact.update(businessContact, { where: { business_associate_contact_id: id }, transaction: t });
    await t.commit();
    res.status(200).send({ message: 'Updated' });
  } catch (error) {
    await t.rollback();
    res.status(500).send(error);
  }
});

router.put('/business-address-and-contact/:idaddress/:idcontact', [auth], async (req, res) => {
  const idAddress = req.params['idaddress'];
  const idContact = req.params['idcontact'];
  console.log(idAddress)
  console.log(idContact)
  const { body } = req;
  const t = await db.sequelize.transaction();
  try {
    let updateBusinessAddress;
    const businessAdress = {
      full_address: body.business_address_line_1,
      state: body.state,
      city: body.city.substring(0, 25),
      zip: body.zip
    };
    updateBusinessAddress = await BusinessAdress.update(businessAdress, { where: { business_address_id: idAddress }, transaction: t });
    const contact_email = body.contact_email;
    const businessContact = {
      business_address_id : idAddress,
      contact_name: body.contact_name,
      contact_email: body.contact_email,
      contact_phone_number: body.contact_phone_number,
    };
    let contact = await BusinessContact.findOne({ where: { contact_email }, transaction: t });
    if (contact) {
      contact = await contact.update({ business_address_id : idAddress, contact_name: body.contact_name, contact_phone_number: body.contact_phone_number }, { transaction: t });
    } else {
      const updateBusinessContact = await BusinessContact.update(businessContact, { where: { business_associate_contact_id: idContact }, transaction: t });
    }    
    await t.commit();
    res.status(200).send({
      businessAdress: updateBusinessAddress,
    })
  } catch (error) {
    await t.rollback();
    logger.error(error);
    res.status(500).send(error);
  }
});

router.post('/business-address-and-contact/:id', [auth], async (req, res) => {
  logger.info(`Starting endpoint business.route/business-address-and-contact/:id with params ${JSON.stringify(req.params, null, 2)}`);
  const id = req.params['id'];
  const user = req.user;
  const { body } = req;
  const t = await db.sequelize.transaction();
  try {
    let newBusinessAddress;
    const businessAdress = {
      business_associate_id: id,
      business_address_line_1: body.business_address_line_1,
      business_address_line_2: body.business_address_line_1,
      full_address: body.business_address_line_1,
      state: body.state,
      city: body.city.substring(0, 25),
      zip: body.zip
    };    
    newBusinessAddress = await BusinessAdress.create(businessAdress, { transaction: t });
    const businessContact = {
      business_address_id: newBusinessAddress.business_address_id,
      contact_name: body.contact_name,
      contact_phone_number: body.contact_phone_number || 'No number provided'
    };
    const contact_email = body.contact_email;
    let contact = await BusinessContact.findOne({ where: { contact_email }, transaction: t });
    if (contact) {
      contact = await contact.update(businessContact, { transaction: t });
    } else {
      contact = await BusinessContact.create({
        ...businessContact,
        contact_email: contact_email
      }, { transaction: t });
    }    
    await t.commit();
    res.status(201).send({
      businessAdress: newBusinessAddress,
    })
  } catch (error) {
    await t.rollback();
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

router.post('/create-contact/:idaddress', [auth], async (req, res) => {
  const { business_address_id, contact_name, contact_email, contact_phone_number } = req.body;
  const { full_address, state, city, zip } = req.body;
  const idAddress = req.params['idaddress'];
  console.log(idAddress)
  const t = await db.sequelize.transaction();
  try {
    let updateBusinessAddress;
    const businessAdress = {
      full_address,
      state,
      city: city.substring(0, 25),
      zip,
    };
    updateBusinessAddress = await BusinessAdress.update(businessAdress, { where: { business_address_id: idAddress }, transaction: t });    
    let contact = await BusinessContact.findOne({ where: { contact_email }, transaction: t });
    if (contact) {
      contact = await contact.update({ idAddress, contact_name, contact_phone_number }, { transaction: t });
    } else {
      contact = await BusinessContact.create({
        idAddress,
        contact_name,
        contact_email,
        contact_phone_number,
        business_address_id: idAddress,
      }, { transaction: t });
    }
    await t.commit();
    res.status(200).send(contact);
  } catch(error) {
    await t.rollback();
    res.status(500).send(error);
  }
});


export default router;
