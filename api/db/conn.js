require('dotenv').config();
const mongoose = require('mongoose');

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Mongoose connected!');
};

main().catch(err => console.log(err));

module.exports = mongoose;