const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, "..", ".env"),
});

const mongoose = require("mongoose");
const User = require("../models/User");

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    const user = await User.findOneAndUpdate(
      { email: "subhjitu7207@gmail.com" }, // <-- Replace with the email you registered with
      { isAdmin: true },
      { new: true }
    );

    if (user) {
      console.log(`✅ Admin role assigned to: ${user.name} (${user.email})`);
    } else {
      console.log(
        "❌ User not found. Make sure you registered first and the email is correct."
      );
    }

    await mongoose.connection.close();
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });