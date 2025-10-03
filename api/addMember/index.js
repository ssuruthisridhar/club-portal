const { CosmosClient } = require("@azure/cosmos");
const { v4: uuidv4 } = require("uuid");

const client = new CosmosClient(process.env.COSMOS_DB_CONNECTION_STRING);
const db = client.database(process.env.COSMOS_DB_DATABASE);
const regContainer = db.container(process.env.COSMOS_DB_CONTAINER_REGISTRATIONS);

module.exports = async function (context, req) {
  try {
    const { name, email, event } = req.body;
    if (!name || !email || !event) {
      context.res = { status: 400, body: { error: "Missing fields" } };
      return;
    }
    const doc = {
      id: uuidv4(),
      name, email, event,
      date: new Date().toISOString()
    };
    const { resource } = await regContainer.items.create(doc);
    context.res = { status: 201, body: resource };
  } catch (err) {
    context.log.error(err);
    context.res = { status: 500, body: { error: err.message } };
  }
};
