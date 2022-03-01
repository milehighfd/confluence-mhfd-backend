module.exports = {
  up: (queryInterface, Sequelize) => {
      return queryInterface.sequelize.transaction(t => {
          return Promise.all([
              queryInterface.changeColumn('newnotes', 'content', {
                  type: Sequelize.TEXT,
                  allowNull: true,
              }, {
                  transaction: t,
              })
          ])
      })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t=> {  
        return Promise.all([
            queryInterface.changeColumn('newnotes', 'content', {
                type: Sequelize.STRING,
                allowNull: true,
            }, {
                transaction,
            })
        ])
    })
  }
};