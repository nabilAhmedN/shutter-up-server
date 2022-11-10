const express = require("express");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middle wares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.0byrl94.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});

async function run() {
    try {
        const serviceCollection = client.db("shutterUp").collection("services");

        const reviewsCollection = client.db("shutterUp").collection("reviews");

        app.post("/jwt", (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: "2 days",
            });
            res.send({ token });
        });

        // read all
        app.get("/services", async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            // const service = await cursor.limit(3).toArray();
            const service = await cursor.toArray();
            let newData = service.sort((a,b) => b.date.localeCompare(a.date))
            res.send(newData);
        });

        app.get("/allservices", async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const service = await cursor.toArray();
            let newData = service.sort((a, b) => b.date.localeCompare(a.date));
            res.send(newData);
        });

        app.get("/services/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        });

        // post on services
        app.post("/services", async (req, res) => {
            const reveiw = req.body;
            const result = await serviceCollection.insertOne(reveiw);
            res.send(result);
        });

        app.get("/reviews", async (req, res) => {
            let query = {};
            if (req.query.service) {
                query = {
                    service: req.query.service,
                };
            } else if (req.query.email) {
                query = {
                    email: req.query.email,
                };
            }
            const cursor = reviewsCollection.find(query);
            const result = await cursor.toArray();

            let sortdata = result.sort((x, y) => y.date.localeCompare(x.data));

            res.send(sortdata);
        });

        app.post("/reviews", async (req, res) => {
            const order = req.body;
            const result = await reviewsCollection.insertOne(order);
            res.send(result);
        });

        // delete
        app.delete("/reviews/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewsCollection.deleteOne(query);
            res.send(result);
        });

        // update
        app.get("/reviews/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await reviewsCollection.findOne(query);
            res.send(service);
        });
        app.put("/reviews/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const user = req.body;

            const option = { upsert: true };
            const updateUser = {
                $set: {
                    service: user.service,
                    serviceName: user.serviceName,
                    price: user.price,
                    reviewer: user.reviewer,
                    email: user.email,
                    img: user.img,
                    rating: user.rating,
                    date: user.date,
                    message: user.message,
                },
            };
            const result = await reviewsCollection.updateOne(
                filter,
                updateUser,
                option
            );

            res.send(result);
        });
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
