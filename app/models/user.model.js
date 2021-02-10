module.exports = (sequelize, Sequelize) => {
    return sequelize.define("user", {
        firstName: {
            type: Sequelize.STRING
        },
        lastName: {
            type: Sequelize.STRING
        },
        image: {
            type: Sequelize.BLOB('long')
        },
        pdf: {
            type: Sequelize.BLOB('long')
        }
    });
};