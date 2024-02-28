const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// middlewares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xljmjxf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const usersCollection = client.db('my-cashDB').collection('users');
const transactionCollection = client.db('my-cashDB').collection('transactions');
const commissionCollection = client.db('my-cashDB').collection('commissions');
const requestCollection = client.db('my-cashDB').collection('requests');

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
    // Post Jwt token
    app.post('/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1hr',
      });
      console.log(token);
      res.send({ success: true });
    });

    // users data get method
    app.get('/users', async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    // user data post method
    app.post('/users', async (req, res) => {
      const newUser = req.body;
      const result = await usersCollection.insertOne(newUser);
      res.send(result);
    });

    //  get all users data
    app.get('/users', async (req, res) => {
      let query = {};
      if (req.query.email) {
        query = { email: req.query.email };
      }
      const result = await usersCollection.findOne(query);
      res.send(result);
    });

    // users requests get method
    app.get('/requests', async (req, res) => {
      const result = await requestCollection.find().toArray();
      res.send(result);
    });
    // users requests post method
    app.post('/requests', async (req, res) => {
      const request = req.body;
      const result = await requestCollection.insertOne(request);
      res.send(result);
    });
    // transactions data post method
    app.post('/commissions', async (req, res) => {
      const commission = req.body;
      const result = await commissionCollection.insertOne(commission);
      res.send(result);
    });

    // commission data get method
    app.get('/commissions', async (req, res) => {
      const result = await commissionCollection.find().toArray();
      res.send(result);
    });
    // transactions data post method
    app.post('/transactions', async (req, res) => {
      const transaction = req.body;
      const result = await transactionCollection.insertOne(transaction);
      res.send(result);
    });
    // transactions data get method
    app.get('/transactions', async (req, res) => {
      const result = await transactionCollection.find().toArray();
      res.send(result);
    });

    //get specific user transactions by name
    app.get('/user-transactions', async (req, res) => {
      let query = {};
      if (req.query.name) {
        query = { sender: req.query.name };
      }
      console.log(query);
      const result = await transactionCollection.find(query).toArray();
      res.send(result);
    });

    app.put('/users/:id', async (req, res) => {
      const id = req.params.id;
      const updatedBalance = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: false };
      const coupon = {
        $set: {
          coupon: updatedBalance.fee,
        },
      };
      const result = await usersCollection.updateOne(filter, coupon, options);
      res.send(result);
    });

    // users data delete method
    app.delete('/users/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('your server is running');
});

app.listen(port, () => {
  console.log(`your server is running on port ${port}`);
});
