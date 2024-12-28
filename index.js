// Require Import Essential Files:
require("dotenv").config();
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const port = process.env.Port || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
// DataBase Connect
const uri = `mongodb+srv://${process.env.DB_Store}:${process.env.DB_Pass}@cluster0.ymamf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// middleWare
app.use(express.json());
app.use(cors());
app.use(cookieParser());
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const DataBase = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function DataHome() {
  try {
    console.log(
      "Your sever Connect with You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you call
  }
}
DataHome().catch(console.dir);
