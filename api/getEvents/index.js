const { CosmosClient } = require("@azure/cosmos");
const client = new CosmosClient(process.env.COSMOS_DB_CONNECTION_STRING);
const db = client.database(process.env.COSMOS_DB_DATABASE);
const container = db.container(process.env.COSMOS_DB_CONTAINER_EVENTS);

module.exports = async function (context, req) {
  try {
    const { resources } = await container.items
      .query('SELECT * FROM c ORDER BY c.date')
      .fetchAll();
    context.res = { status: 200, body: resources };
  } catch (err) {
    context.log.error(err);
    context.res = { status: 500, body: { error: err.message } };
  }
};
