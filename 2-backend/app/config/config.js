module.exports = {
    secret: 'supersecret',
    dburl: process.env.MONGO_DB_URL,
    dbdatacollector: process.env.MONGO_DB_DATACOLLECTOR,
    acronym: process.env.PROJECT_ACRONYM
};
