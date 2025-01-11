require("dotenv").config();
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const port = process.env.Port || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { use } = require("express/lib/application");
const uri = `mongodb+srv://${process.env.DB_Store}:${process.env.DB_Pass}@cluster0.ymamf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// middleWare
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://tuitor-find.web.app",
      "https://tuitor-find.firebaseapp.com",
    ],
    credentials: true,
  })
);
app.use(cookieParser());
// for root Componenet Api
app.get("/", (req, res) => {
  res.send("Hello world");
});
app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;
  console.log("verify line", token);
  if (!token) {
    return res.status(401).send({ message: "Unauthorized access" });
  }
  jwt.verify(token, process.env.Acces_ToKen, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized access" });
    }
    req.decoded = decoded;
    next();
  });
};
// Database Setup

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
    // User Database
    const MemberDataBase = client.db("TuitorPageUser").collection("users");
    const BookedTuitors = client
      .db("TuitorPageUser")
      .collection("TuitorBooked");
    // Tuitotial Database
    const TuitorialDataBase = client
      .db("TuitorPageUser")
      .collection("tuitorial");
    // Connect the client to the server
    app.post("/users", async (req, res) => {
      const tuitorUser = req.body; //data from frontend
      console.log("new user", tuitorUser);
      try {
        const result = await MemberDataBase.insertOne(tuitorUser);
        console.log("Insert result:", result);
        res.status(201).send({ insertedId: result.insertedId });
      } catch (error) {
        console.error("MongoDB insert error:", error);
        res.status(500).send({ message: "Database error" });
      }
    });
    // Addtuitotial to server to database (Create)
    app.post("/tuitorial", async (req, res) => {
      const tuitorial = req.body; //data from frontend
      console.log("new tuitorial", tuitorial);
      try {
        const result = await TuitorialDataBase.insertOne(tuitorial);
        console.log("Insert result:", result);
        res.status(201).send({ insertedId: result.insertedId });
      } catch (error) {
        console.error("MongoDB insert error:", error);
        res.status(500).send({ message: "Database error" });
      }
    });
    // Add-tuitotial to server to database (Get)
    app.get("/tuitorial", async (req, res) => {
      const tuitorial = await TuitorialDataBase.find({}).toArray();
      res.send(tuitorial);
    });
    app.get("/tuitorial/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const tuitorialById = await TuitorialDataBase.findOne(query);
      res.send(tuitorialById);
    });
    // My-tuitotial to server to database (Get)
    app.get("/mytuitorial", verifyToken, async (req, res) => {
      const email = req.query?.email;
      const query = { email: email };
      console.log(
        { Decorded: req.decoded?.email },
        { Query: req.query?.email }
      );
      //
      if (req.decoded?.email !== req.query?.email) {
        return res.status(403).send({ message: "forbidden access" });
      }
      const mytuitorialById = await TuitorialDataBase.find(query).toArray();
      res.send(mytuitorialById);
    });
    // My-tuitotial to server by Id to database (Get)
    app.get("/mytuitorials/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const mytuitorialById = await TuitorialDataBase.findOne(query);
      res.send(mytuitorialById);
    });
    // Update Tuitotial to server to database (Update)

    app.put("/mytuitorials/:id", async (req, res) => {
      const id = req.params.id;
      const user = req.body; // date take from client side
      console.log(id, user);
      // Update Operation conect with DataBase
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateUser = {
        $set: {
          PhotoUrl: user.PhotoUrl,
          language: user.language,
          price: user.price,
          description: user.description,
        },
      };
      const result = await TuitorialDataBase.updateOne(
        filter,
        updateUser,
        options
      );
      res.send(result);
    });
    // Delete Equipment API
    app.delete("/mytuitorials/:id", async (req, res) => {
      const id = req.params.id; // Get the ID from the URL parameters
      const query = { _id: new ObjectId(id) }; // Create the filter for deletion
      const result = await TuitorialDataBase.deleteOne(query); // Delete the document
      res.send({ success: true, message: "Equipment deleted successfully" });
    });
    app.get("/tutors/:language", verifyToken, async (req, res) => {
      try {
        const { language } = req.params;
        const query = { language: language };
        const cursor = TuitorialDataBase.find(query);

        const items = await cursor.toArray();
        res.status(200).send(items);
      } catch (error) {
        console.error("Error fetching tutors:", error);
        res
          .status(500)
          .send({ message: "Server error, please try again later." });
      }
    });
    app.post("/mybooked-tuitor", async (req, res) => {
      const Bookedtuitor = req.body; //data from frontend
      console.log("Your Booked Tuitor", Bookedtuitor);
      try {
        const result = await BookedTuitors.insertOne(Bookedtuitor);
        console.log("Insert result:", result);
        res.status(201).send({ insertedId: result.insertedId });
      } catch (error) {
        console.error("MongoDB insert error:", error);
        res.status(500).send({ message: "Database error" });
      }
    });
    app.get("/mybooked-tuitor", async (req, res) => {
      const email = req.query.email;
      console.log(email);
      const query = { Useremail: email };
      const bookingtuitor = await BookedTuitors.find(query).toArray();
      res.send(bookingtuitor);
    });
    app.patch("/mybooked-tuitor/:id", async (req, res) => {
      const id = req.params.id;

      const query = { _id: new ObjectId(id) };
      const bookingtuitor = await BookedTuitors.find(query).toArray();
      res.send(bookingtuitor);
    });
    // JWT token APIs
    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.Acces_ToKen, {
        expiresIn: "5h",
      });
      //Setting a Cookies
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      });
      res.send({ success: true });
    });
    // JWT Token Remove
    app.post("/logout", (req, res) => {
      res
        .clearCookie("token", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true });
    });

    console.log(
      "Your sever Connect with You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);
