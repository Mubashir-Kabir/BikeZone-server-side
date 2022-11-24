//required packages
const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const app = express();

//middleware
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 5000;

//root route
app.get("/", (req, res) => {
  res.send("Server is Up...");
});

//mongodb connection
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.PASSWORD}@cluster0.erzixne.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri);

//database collections
const dbCategories = client.db("bikeZone").collection("bikeCategory");
const dbProducts = client.db("bikeZone").collection("products");

//database connection function
const dbConnection = async () => {
  try {
    await client.connect();
    console.log("Database connected successfully");
  } catch (error) {
    console.log("Database connection error", error.name, error.message);
  }
};
dbConnection();

//get categories
//for limited services query params "limit" should be added
app.get("/categories", async (req, res) => {
  try {
    const cursor = dbCategories.find({});
    const categories = await cursor.toArray();
    res.send({
      status: true,
      data: categories,
    });
  } catch (err) {
    console.log(err.name, err.message);
    res.send({
      status: false,
      data: err.name,
    });
  }
});
//post products
//need request body in json formate
app.post("/products", async (req, res) => {
  try {
    const result = await dbProducts.insertOne(req.body);
    if (result.insertedId) {
      res.send({
        status: true,
        data: result.insertedId,
      });
    } else {
      res.send({
        status: false,
        data: "something wrong",
      });
    }
  } catch (err) {
    console.log(err.name, err.message);
    res.send({
      status: false,
      data: err.name,
    });
  }
});

//server listener
app.listen(port, () => {
  console.log(`server is listening at port ${port}`);
});
