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

//server listener
app.listen(port, () => {
  console.log(`server is listening at port ${port}`);
});
