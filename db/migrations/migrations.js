module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.changeColumn(
          'newnotes',
          'content',
          {
            type: Sequelize.TEXT,
            allowNull: true,
          },
          {
            transaction: t,
          }
        ),
        ...([0, 1, 2, 3, 4, 5].map(index => {
          return queryInterface.addColumn(
            'board-projects',
            `originPosition${index}`,
            {
              type: Sequelize.INTEGER,
            },
            {
              transaction: t
            }
          )
        }))
      ])
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
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