const mongoose = require("mongoose")


const connectedToDb = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log("connected to db")
  } catch (error) {
    console.log(error);
  }
}

module.exports = connectedToDb