//required packages
const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
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
const dbBooking = client.db("bikeZone").collection("bookings");

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

//get advertized  products
app.get("/advertize", async (req, res) => {
  try {
    const cursor = dbProducts.find({ advertize: true });
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

//get product by product id
app.get("/product", async (req, res) => {
  try {
    const product = await dbProducts.findOne({ _id: ObjectId(req.query.id) });
    res.send({
      status: true,
      data: product,
    });
  } catch (err) {
    console.log(err.name, err.message);
    res.send({
      status: false,
      data: err.name,
    });
  }
});

//get product by user email
app.get("/userproduct", async (req, res) => {
  try {
    const cursor = dbProducts.find({ seller: req.query.seller });
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

//get all user by role (buyer/seller)
app.get("/allusers", async (req, res) => {
  try {
    const cursor = dbUsers.find({ role: req.query.role });
    const users = await cursor.toArray();
    res.send({
      status: true,
      data: users,
    });
  } catch (err) {
    console.log(err.name, err.message);
    res.send({
      status: false,
      data: err.name,
    });
  }
});

//get booking product by email
app.get("/bookings", async (req, res) => {
  try {
    const cursor = dbBooking.find({ email: req.query.email });
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

//post booking
//need request body in json formate
app.post("/bookings", async (req, res) => {
  try {
    const result = await dbBooking.insertOne(req.body);
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

//delete specific product with product id (_id)
app.delete("/products/:id", async (req, res) => {
  try {
    const query = { _id: ObjectId(req.params.id) };
    const result = await dbProducts.deleteOne(query);
    if (result.deletedCount) {
      res.send({
        status: true,
        message: "deleted successfully",
      });
    } else {
      res.send({
        status: false,
        message: "something wrong, try again",
      });
    }
  } catch (err) {
    console.log(err.name, err.message);
    res.send({
      status: false,
      message: err.name,
    });
  }
});

//delete specific user with user id (_id)
app.delete("/users/:id", async (req, res) => {
  try {
    const query = { _id: ObjectId(req.params.id) };
    const result = await dbUsers.deleteOne(query);
    if (result.deletedCount) {
      res.send({
        status: true,
        message: "deleted successfully",
      });
    } else {
      res.send({
        status: false,
        message: "something wrong, try again",
      });
    }
  } catch (err) {
    console.log(err.name, err.message);
    res.send({
      status: false,
      message: err.name,
    });
  }
});

//Update advertize field of product
app.put("/advertize/:id", async (req, res) => {
  try {
    const filter = { _id: ObjectId(req.params.id) };
    const options = { upsert: true };
    const updatedDoc = {
      $set: {
        advertize: true,
      },
    };
    const result = await dbProducts.updateOne(filter, updatedDoc, options);
    if (result.acknowledged) {
      res.send({
        status: true,
        message: "Advertize successfully",
      });
    } else {
      res.send({
        status: false,
        message: "something wrong, try again",
      });
    }
  } catch (err) {
    console.log(err.name, err.message);
    res.send({
      status: false,
      message: err.name,
    });
  }
});

//Update user verified field
app.put("/userverify/:id", async (req, res) => {
  try {
    const filter = { _id: ObjectId(req.params.id) };
    const options = { upsert: true };
    const updatedDoc = {
      $set: {
        verified: true,
      },
    };
    const result = await dbUsers.updateOne(filter, updatedDoc, options);
    if (result.acknowledged) {
      res.send({
        status: true,
        message: "Verified successfully",
      });
    } else {
      res.send({
        status: false,
        message: "something wrong, try again",
      });
    }
  } catch (err) {
    console.log(err.name, err.message);
    res.send({
      status: false,
      message: err.name,
    });
  }
});

//server listener
app.listen(port, () => {
  console.log(`server is listening at port ${port}`);
});
