const express = require("express");
require("dotenv").config();
const cors = require("cors");
const app = express();
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

    const inClassCollection = client.db("ninjutsuDb").collection("inClass");
    const selectedClassCollection = client
      .db("ninjutsuDb")
      .collection("selectedClass");
    // NAME: All Data
    app.get("/instructors", async (req, res) => {
      const result = await inClassCollection.find().toArray();
      res.send(result);
    });

    // NAME: Selected Class Collection
    app.post("/selectedClasses", async (req, res) => {
      const selectedClass = req.body;
      const result = await selectedClassCollection.insertOne(selectedClass);
      res.send(result);
    });

    app.get("/selectedClasses", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      console.log(req.query.email);
      const result = await selectedClassCollection.find(query).toArray();
      res.send(result);
    });

    app.delete("/selectedClasses/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await selectedClassCollection.deleteOne(query);
      res.send(result);
    });
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
