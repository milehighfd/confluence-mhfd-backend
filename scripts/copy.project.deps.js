require('dotenv').config();

const needle = require('needle');
const db = require('../config/db');

db.sequelize.sync();
const ProjectComponent = db.projectComponent;
const IndependentComponent = db.independentComponent;

needle.defaults({ open_timeout: 60000 });
(async () => {
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
    await new Promise(resolve => setTimeout(resolve, 5000));
    const projectid = 1000010;
    const newProjectId = 1000343;
    const components = await ProjectComponent.findAll({
        where: {
          projectid: projectid
        }
      });
      for (const component of components) {
        const dataComponent = {
          table: component.table,
          projectid: newProjectId,
          objectid: component.objectid
        };
        await ProjectComponent.create(dataComponent);
      }
      const independentComponents = await IndependentComponent.findAll({
        where: {
          projectid: projectid
        }
      });
      for (const independent of independentComponents) {
        const element = {
          name: independent.name,
          cost: independent.cost,
          status: independent.status,
          projectid: newProjectId
        };
        await IndependentComponent.create(element);
      }
})();
