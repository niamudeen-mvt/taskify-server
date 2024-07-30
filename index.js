require("dotenv").config();
const express = require("express");
const cors = require("cors");
const router = require("./routes/index.js");
const connectDb = require("./utils/db.js");
const colors = require("colors");
const app = express();
const stripe = require("stripe")(process.env.STRIPE_SECRET_TEST_KEY);

const PORT = process.env.PORT || 7500;

app.use(express.json());
app.use(cors({ origin: "*" }));

app.use("/api/v1", router);

app.get("/", (req, res) => {
  res.send("test-backend is working");
});
app.post("/cart-checkout", async (req, res) => {
  try {
    const { products } = req.body;

    const lineItems = products.map((product) => {
      return {
        quantity: product.qty,
        price_data: {
          currency: "usd",
          unit_amount: product.price * 100,
          product_data: {
            name: product.title,
          },
        },
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
    });

    res.status(200).json({ id: session.id });
  } catch (error) {
    console.log("error: ", error);
    res.status(200).json({ error: error.message });
  }
});

connectDb();
app.listen(PORT, () => {
  console.log(`server is running at port: ${PORT}`.bgMagenta);
});
