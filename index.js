require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const stripr = require("stripe")(process.env.PAYMENT_SECRET_KEY);
const port = process.env.PORT || 5000;

// middleware
app.use(express.json());
app.use(cors());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zkohjx0.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    // NAME: Collections

    const inClassCollection = client.db("ninjutsuDb").collection("inClass");
    const userCollection = client.db("ninjutsuDb").collection("users");
    const selectedClassCollection = client
      .db("ninjutsuDb")
      .collection("selectedClass");
    const instructorClassCollection = client
      .db("ninjutsuDb")
      .collection("instructorClass");
    const instructorsCollection = client
      .db("ninjutsuDb")
      .collection("instructors");

    // NAME: All Data

    app.get("/instructors", async (req, res) => {
      const result = await instructorsCollection.find().toArray();
      res.send(result);
    });

    // NAME: Selected Class Collection

    app.get("/selectedClasses", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      console.log(req.query.email);
      const result = await selectedClassCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/selectedClasses", async (req, res) => {
      const selectedClass = req.body;
      const result = await selectedClassCollection.insertOne(selectedClass);
      res.send(result);
    });
    // delete selected class via student
    app.delete("/selectedClasses/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await selectedClassCollection.deleteOne(query);
      res.send(result);
    });
    // NAME: User Collection

    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });
    // Get Role
    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);

      const result = { role: user?.role };
      res.send(result);
    });
    // Add User
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "user exists" });
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });
    // Update Role via Admin
    app.patch("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const checkRole = await userCollection.findOne(filter);
      if (checkRole.role === "admin") {
        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
          $set: {
            role: "instructor",
          },
        };
        const result = await userCollection.updateOne(filter, updateDoc);
        return res.send(result);
      }
      const updateDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // NAME: Instructors Class
    app.get("/instructorClass", async (req, res) => {
      const sortBy = {
        classStudent: -1,
      };
      const result = await instructorClassCollection
        .find()
        .sort(sortBy)
        .toArray();
      res.send(result);
    });
    app.get("/instructorClass/:email", async (req, res) => {
      const email = req.params.email;
      const query = { instructorEmail: email };
      const result = await instructorClassCollection.find(query).toArray();
      res.send(result);
    });
    // update approved,deny,feedback
    app.patch("/instructorClass/:id/:status", async (req, res) => {
      const id = req.params.id;
      const status = req.params.status;
      const filter = { _id: new ObjectId(id) };
      console.log(status);
      if (status == "approved") {
        const updateDoc = {
          $set: {
            status: "approved",
          },
        };
        const result = await instructorClassCollection.updateOne(
          filter,
          updateDoc
        );
        return res.send(result);
      }
      if (status == "deny") {
        const updateDoc = {
          $set: {
            status: "denied",
          },
        };
        const result = await instructorClassCollection.updateOne(
          filter,
          updateDoc
        );
        console.log(result);
        return res.send(result);
      }
    });
    // add instructor class
    app.post("/instructorClass", async (req, res) => {
      const addClass = req.body;
      const result = await instructorClassCollection.insertOne(addClass);
      console.log(result);
      res.send(result);
    });

    // NAME: Manage Users
    app.get("/manageClass", async (req, res) => {
      const filter = {
        instructorEmail: { $exists: true },
      };
      const result = await instructorClassCollection.find(filter).toArray();
      res.send(result);
    });

    // NAME: Payment

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Ninjutsu ");
});

app.listen(port, () => {
  console.log(`Ninjutsu is running on ${port}`);
});
