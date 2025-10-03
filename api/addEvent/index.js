const { CosmosClient } = require("@azure/cosmos");
const { BlobServiceClient } = require("@azure/storage-blob");
const { v4: uuidv4 } = require("uuid");

const cosmos = new CosmosClient(process.env.COSMOS_DB_CONNECTION_STRING);
const db = cosmos.database(process.env.COSMOS_DB_DATABASE);
const eventsContainer = db.container(process.env.COSMOS_DB_CONTAINER_EVENTS);

const blobService = BlobServiceClient.fromConnectionString(process.env.BLOB_CONNECTION_STRING);
const containerName = process.env.BLOB_CONTAINER_NAME;
const containerClient = blobService.getContainerClient(containerName);

module.exports = async function (context, req) {
  try {
    // admin protection
    const adminKey = req.headers["x-admin-key"] || req.query.adminKey;
    if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
      context.res = { status: 401, body: { error: "Unauthorized" } };
      return;
    }

    const { title, date, description, imageBase64, imageName } = req.body;
    if (!title || !date) {
      context.res = { status: 400, body: { error: "Missing title or date" } };
      return;
    }

    let imageUrl = req.body.imageUrl || null;

    if (imageBase64) {
      await containerClient.createIfNotExists();
      const blobName = `${Date.now()}-${imageName || uuidv4()}`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      const buffer = Buffer.from(imageBase64, "base64");
      await blockBlobClient.uploadData(buffer);
      imageUrl = blockBlobClient.url;
    }

    const newEvent = {
      id: uuidv4(),
      title,
      date,
      description: description || "",
      imageUrl,
      createdAt: new Date().toISOString()
    };

    const { resource } = await eventsContainer.items.create(newEvent);

    context.res = { status: 201, body: resource };
  } catch (err) {
    context.log.error(err);
    context.res = { status: 500, body: { error: err.message } };
  }
};
