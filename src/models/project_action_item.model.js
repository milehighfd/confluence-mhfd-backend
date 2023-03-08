export default (sequelize, DataType) => {
    const projectActionItem = sequelize.define('project_action_item', {
        project_action_item_id: {
            type: DataType.INTEGER,
            primaryKey: true,            
            autoIncrement: true
        },
        code_rule_action_item_id: {
            type: DataType.INTEGER
        },
        project_id: {
            type: DataType.INTEGER,
        },
        created_by: {
            type: DataType.STRING
        },
        last_modified_by: {
            type: DataType.STRING
        },
        last_modified_date: {
            type: DataType.DATE,
        }, 
        completed_date: {
            type: DataType.DATE,
        },
        created_date: {
            type: DataType.DATE,
        }
    }, {
        
        freezeTableName: true,
        tableName: 'project_action_item',
        createdAt: false,
        updatedAt: false
    });

    return projectActionItem;
}
