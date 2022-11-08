const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middle wares
app.use(cors());
app.use(express.json());

// user: shutterUpDBUser
// password: FWE8iFMd4D1lKtWO

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.0byrl94.mongodb.net/?retryWrites=true&w=majority`;

console.log(uri);

const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});

async function run() {
    try {
        const serviceCollection = client.db("shutterUp").collection("services");

        const reviewsCollection = client.db("shutterUp").collection("reviews");

        app.get("/services", async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const service = await cursor.limit(3).toArray();
            res.send(service);
        });

        app.get("/allservices", async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const service = await cursor.toArray();
            res.send(service);
        });

        app.get("/services/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        });

        app.post('/reviews', async(req, res) => {
            const order = req.body;
            const result = await reviewsCollection.insertOne(order)
            res.send(result)
        })

    } finally {
    }
}
run().catch((err) => console.error(err));

app.get("/", (req, res) => {
    res.send("shutter up server is running");
});

app.listen(port, () => {
    console.log(`shutter up server running on ${port}`);
});
