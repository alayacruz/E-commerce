import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import express from "express";
import { Client } from "@elastic/elasticsearch";
import { error } from "console";
import prisma from "./db.js";

dotenv.config();
const searchRouter = express.Router();
const elasticClient = new Client({
  node: process.env.ELASTIC_ENDPOINT,
  auth: {
    apiKey: process.env.ELASTIC_API_KEY,
  },
});

const createIndex = async () => {
  try {
    const exists = await elasticClient.indices.exists({
      index: "product_index",
    });
    if (!exists) {
      const createResponse = await elasticClient.indices.create({
        index: "product_index",
        body: {
          mappings: {
            properties: {
              productName: { type: "keyword" },
              productDesc: { type: "text" },
              availableQuantity: { type: "integer" },
              price: { type: "float" },
              features: { type: "text" },
              specs: { type: "text" },
            },
          },
        },
      });

      console.log(`Index 'product_index' created successfully.`);
      return createResponse;
    } else
      console.log(`Index 'product_index' already exists. Skipping creation.`);
  } catch (error) {
    console.error(`Error creating index product_index:`, error);
    throw error;
  }
};

const indexProducts = async () => {
  const products = await prisma.product.findMany();
  await Promise.all(
    products.map(async (e) => {
      const doc = await elasticClient.index({
        index: "product_index",
        id: e.productId,
        document: {
          productName: e.name,
          productDesc: e.description,
          availableQuantity: e.availableQuantity,
          price: e.price,
          features: e.features,
          specs: e.specifications,
        },
      });
      return doc;
    })
  );
  const test2 = await elasticClient.search({
    query: {
      match: {
        productDesc: "intel",
      },
    },
    explain: true,
  });
  // console.log(
  // test2.hits,
  // test2.hits.hits[0]._source,
  // test2.hits.hits[0]._explanation,
  // test2.hits.hits[0]._explanation.details[0].details
  // );
};

const initializeAndStartServer = async () => {
  try {
    await createIndex();
    await indexProducts();
    console.log(
      "Elasticsearch index created and products indexed successfully."
    );
  } catch (e) {
    console.error("Elasticsearch Initialization Error: ", e);
  }
};

initializeAndStartServer();

searchRouter.post("/", async (req, res) => {
  const { searchStr } = req.body;
  if (!searchStr)
    return res.status(400).json({ error: "Search string not provided" });
  try {
    let searchResId = [];
    const matches = await elasticClient.search({
      query: {
        multi_match: {
          query: searchStr,
          fields: ["productName", "productDesc", "features", "specs"],
          type: "best_fields",
        },
      },
    });
    matches.hits.hits.map((e) => {
      searchResId.push(String(e._id));
    });
    console.log("searcResIds", searchResId);
   const results = await prisma.product.findMany({
  where: {
    productId: {
      in: searchResId,
    },
  },
 
  include: {
    category: {
      select: { categoryName: true },
    },
    _count: {
      select: { reviews: true },
    },
  },
});
    console.log("results arr: ", results);
    if (!results)
      return res.status(200).json({ message: "Nothing to see here!" });
    return res.status(200).json(results);
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: e });
  }
});
export default searchRouter;
// test2.hits.hits is [
//     {
//       _shard: '[product_index][0]',
//       _node: 'J7oOHJN2QUarl_IKDzSiSg',
//       _index: 'product_index',
//       _id: '8ee2f697-9306-4fbd-8f0f-0e12dbe34ff6',
//       _score: 1.6868024,
//       _source: [Object],
//       _explanation: [Object]
//     }
//   ]

/*const products: {
    productId: string;
    name: string;
    description: string | null;
    price: Decimal;
    availableQuantity: number;
    status: string | null;
    seller_id: string;
    imageUrls: string[];
    categoryId: number | null;
    isArchived: boolean;
      features          String[]
  specifications    Json?
}[] */
