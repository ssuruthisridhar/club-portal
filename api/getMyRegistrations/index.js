const { CosmosClient } = require("@azure/cosmos");
const client = new CosmosClient(process.env.COSMOS_DB_CONNECTION_STRING);
const db = client.database(process.env.COSMOS_DB_DATABASE);
const regContainer = db.container(process.env.COSMOS_DB_CONTAINER_REGISTRATIONS);

module.exports = async function (context, req) {
  try {
    const email = (req.query.email || (req.body && req.body.email));
    if (!email) {
      context.res = { status: 400, body: { error: "Missing email" } };
      return;
    }
    const querySpec = {
      query: "SELECT * FROM c WHERE c.email=@email ORDER BY c.date DESC",
      parameters: [{ name: "@email", value: email }]
    };
    const { resources } = await regContainer.items.query(querySpec).fetchAll();
    context.res = { status: 200, body: resources };
  } catch (err) {
    context.log.error(err);
    context.res = { status: 500, body: { error: err.message } };
  }
};
