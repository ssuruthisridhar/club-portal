const { CosmosClient } = require("@azure/cosmos");
const client = new CosmosClient(process.env.COSMOS_DB_CONNECTION_STRING);
const db = client.database(process.env.COSMOS_DB_DATABASE);
const regContainer = db.container(process.env.COSMOS_DB_CONTAINER_REGISTRATIONS);

module.exports = async function (context, req) {
  try {
    const adminKey = req.headers["x-admin-key"] || req.query.adminKey;
    if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
      context.res = { status: 401, body: { error: "Unauthorized" } };
      return;
    }

    const { resources } = await regContainer.items.query('SELECT * FROM c ORDER BY c.date DESC').fetchAll();
    context.res = { status: 200, body: resources };
  } catch (err) {
    context.log.error(err);
    context.res = { status: 500, body: { error: err.message } };
  }
};
