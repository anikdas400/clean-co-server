const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const app = express()

// persers
app.use(express.json())

// mongodb uri
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.393ceno.mongodb.net/clean-co?retryWrites=true&w=majority`;

// const uri ='mongodb://localhost:27017'

// mongodb connection

const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

  async function run() {
    try {
      // Connect the client to the server	(optional starting in v4.7)
      await client.connect();

    //   connect collection
    const servicesCollection = client.db('clean-co').collection('services')
    const bookingCollection = client.db('clean-co').collection('bookings')

    app.get('/api/v1/services', async (req,res)=>{
        const cursor = servicesCollection.find()
        const result = await cursor.toArray()
    
        res.send(result)
    })

    app.post('/api/v1/user/create-booking', async (req,res)=>{
       const booking = req.body
       const result= await bookingCollection.insertOne(booking)
    

        res.send(result)
    })


      // Send a ping to confirm a successful connection
      await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
      // Ensures that the client will close when you finish/error
    //   await client.close();
    }
  }
  run().catch(console.dir);

const port = 5000

app.get('/', (req, res) => {
  res.send('Hello World!')
})



app.listen(port, () => {
  console.log(`clean-co listening on port ${port}`)
})