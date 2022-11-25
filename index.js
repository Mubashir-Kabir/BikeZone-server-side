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
const dbUsers = client.db("bikeZone").collection("users");

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

//get products by categories
app.get("/products", async (req, res) => {
  try {
    const cursor = dbProducts.find({ category: req.query.category });
    const products = await cursor.toArray();
    res.send({
      status: true,
      data: products,
    });
  } catch (err) {
    console.log(err.name, err.message);
    res.send({
      status: false,
      data: err.name,
    });
  }
});

//get user by email
app.get("/users", async (req, res) => {
  try {
    const user = await dbUsers.findOne({ email: req.query.email });
    console.log(user);
    res.send({
      status: true,
      data: user,
    });
  } catch (err) {
    console.log(err.name, err.message);
    res.send({
      status: false,
      data: err.name,
    });
  }
});

//Create users
//need request body in json formate
app.post("/users", async (req, res) => {
  const umail = req.query.email;
  console.log(umail);
  const isExist = await dbUsers.findOne({ email: umail });
  if (isExist) {
    return;
  }

  try {
    const result = await dbUsers.insertOne(req.body);
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
