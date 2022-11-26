//required packages
const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const app = express();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

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
const dbPayments = client.db("bikeZone").collection("payments");

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

//verify jwt token
const verifyJwt = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).send("unauthorized access");
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send("forbidden access");
    }
    req.decoded = decoded;
    next();
  });
};

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
app.get("/category/:id", verifyJwt, async (req, res) => {
  try {
    const cursor = dbProducts.find({ category: req.params.id });
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

//get product by seller email
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
app.get("/allusers", verifyJwt, async (req, res) => {
  try {
    const applierEmail = req.headers?.applieremail || "";
    const decodedEmail = req.decoded?.email;
    if (applierEmail !== decodedEmail) {
      res.send({
        status: false,
        data: "Admin access denied",
      });
    }
    const applier = await dbUsers.findOne({ email: decodedEmail });
    if (applier.role === "Admin") {
      const cursor = dbUsers.find({ role: req.query.role });
      const users = await cursor.toArray();
      res.send({
        status: true,
        data: users,
      });
    } else {
      res.send({
        status: false,
        data: "Admin access denied",
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

//get booking product by email
app.get("/bookings", verifyJwt, async (req, res) => {
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
app.post("/bookings", verifyJwt, async (req, res) => {
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
app.delete("/users/:id", verifyJwt, async (req, res) => {
  try {
    const applierEmail = req.headers?.applieremail || "";
    const decodedEmail = req.decoded?.email;
    if (applierEmail !== decodedEmail) {
      res.send({
        status: false,
        data: "Admin access denied",
      });
    } else {
      const applier = await dbUsers.findOne({ email: decodedEmail });

      if (applier.role === "Admin") {
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
      } else {
        res.send({
          status: false,
          data: "Admin access denied",
        });
      }
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
app.put("/advertize/:id", verifyJwt, async (req, res) => {
  try {
    const decodedEmail = req.decoded?.email;

    const applier = await dbUsers.findOne({ email: decodedEmail });

    if (applier.role === "Seller") {
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
    } else {
      res.send({
        status: false,
        message: "Seller access denied",
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
app.put("/userverify/:id", verifyJwt, async (req, res) => {
  try {
    const applierEmail = req.headers?.applieremail || "";
    const decodedEmail = req.decoded?.email;
    if (applierEmail !== decodedEmail) {
      res.send({
        status: false,
        data: "Admin access denied",
      });
    } else {
      const applier = await dbUsers.findOne({ email: decodedEmail });

      if (applier.role === "Admin") {
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
      } else {
        res.send({
          status: false,
          data: "Admin access denied",
        });
      }
    }
  } catch (err) {
    console.log(err.name, err.message);
    res.send({
      status: false,
      message: err.name,
    });
  }
});

//----------------------------------
//payment intent create and send client secret
app.post("/create-payment-intent", async (req, res) => {
  const product = req.body;
  const price = product.amount;
  const amount = price * 100;

  const paymentIntent = await stripe.paymentIntents.create({
    currency: "usd",
    amount: amount,
    payment_method_types: ["card"],
  });
  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

//after payment sold item update
app.post("/payments", async (req, res) => {
  const payment = req.body;
  const result = await dbPayments.insertOne(payment);
  const id = payment.productId;
  const filter = { _id: ObjectId(id) };
  const options = { upsert: true };
  const updatedDoc = {
    $set: {
      isSold: true,
    },
  };
  const updatedResult = await dbProducts.updateOne(filter, updatedDoc, options);
  res.send(result);
});

//requesting fot jwt token
//need request body in json formate
app.post("/jwt-token", (req, res) => {
  try {
    const token = jwt.sign(req.body, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1d",
    });
    res.send({
      status: true,
      data: token,
    });
  } catch (err) {
    res.send({
      status: false,
      data: err.name,
    });
  }
});

//verifying admin or not
app.get("/admin/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const user = await dbUsers.findOne({ email });
    if (user?.role === "Admin") {
      res.send({
        status: true,
        data: user,
      });
    } else {
      res.send({
        status: false,
        data: user,
      });
    }
  } catch (err) {
    res.send({
      status: false,
      data: err.name,
    });
  }
});

//verifying seller or not
app.get("/seller/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const user = await dbUsers.findOne({ email });
    if (user?.role === "Seller") {
      res.send({
        status: true,
        data: user,
      });
    } else {
      res.send({
        status: false,
        data: user,
      });
    }
  } catch (err) {
    res.send({
      status: false,
      data: err.name,
    });
  }
});

//----------------------------------

//server listener
app.listen(port, () => {
  console.log(`server is listening at port ${port}`);
});
