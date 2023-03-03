export default (sequelize, DataType) => {
    const codeRuleActionItem = sequelize.define('code_rule_action_item', {
        code_rule_action_item_id: {
            type: DataType.INTEGER,
            primaryKey: true
        },
        code_phase_type_id: {
            type: DataType.INTEGER
        },
        action_item_name: {
            type: DataType.STRING,
        },
        is_active: {
            type: DataType.BOOLEAN
        },
    }, {
        freezeTableName: true,
        tableName: 'code_rule_action_item',
        createdAt: false,
        updatedAt: false
    });

    return codeRuleActionItem;
}
