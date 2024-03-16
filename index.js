const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const cors = require('cors')
const cookieParser = require('cookie-parser')
require('dotenv').config()
const app = express()

// persers
app.use(express.json())
app.use(cookieParser())
app.use(cors({
  origin:["http://localhost:5173"],
  credentials:true
}))

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

    // middlewares
    // verify token and grant access

    const gateman = (req, res, next) => {
      const { token } = req.cookies
      // if client does not send token
      if (!token) {
        return res.status(401).send({ message: " You are not authorized too" })
      }


      // verify a token symmetric
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
          return res.status(401).send({ message: " You are not authorized " })
        }
        //  attach decoded ueser to get other user
        req.user = decoded
        next()

      });

    }

    app.get('/api/v1/services', gateman, async (req, res) => {
      const cursor = servicesCollection.find()
      const result = await cursor.toArray()
      res.send(result)
    })

    app.post('/api/v1/user/create-booking', async (req, res) => {
      const booking = req.body
      const result = await bookingCollection.insertOne(booking)


      res.send(result)
    })

    // user specific booking
    app.get('/api/v1/user/booking', gateman, async (req, res) => {
      const queryEmail = req.query.email
      const tokenEmail = req.user.email
      // console.log(req)
      // match user email to check it is a valid user
      if (queryEmail !== tokenEmail) {
        return res.status(403).send({ message: "forbidden access" })

      }

      let query = {}
      if (queryEmail) {
        query.email = queryEmail
        const result = await bookingCollection.findOne({ email: queryEmail })
        res.send(result)
      }

    })

    app.delete('/api/v1/user/cancel-booking/:bookingId', async (req, res) => {

      const id = req.params.bookingId
      const query = { _id: new ObjectId(id) }
      const result = await bookingCollection.deleteOne(query)
      res.send(result)
    })

    // creating token with jwt and send client
    app.post('/api/v1/auth/access-token', async (req, res) => {
      const user = req.body
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
      console.log(token)
      // res.send(user)
      res.cookie('token', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'none'
      }).send({ success: true })


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