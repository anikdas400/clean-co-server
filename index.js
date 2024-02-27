const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const app = express()

// persers
app.use(express.json())

// mongodb uri
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.393ceno.mongodb.net/?retryWrites=true&w=majority`;

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

    app.delete('/api/v1/user/cancel-booking/:bookingId',async (req,res)=>{
  
      const id =req.params.bookingId
      const query = {_id: new ObjectId(id)}
      const result = await bookingCollection.deleteOne(query)
      res.send(result)
    })

    // creating token with jwt and send client
    app.post('/api/v1/auth/access-token', async (req,res)=>{
      const user = req.body
      const token = jwt.sign(user,'secret')
      console.log(token)
      res.send(user)
      

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