require('dotenv').config();
const express = require('express');
const cors = require('cors');
const UserRoutes = require('./routes/UserRoutes');
const PetRoutes = require('./routes/PetRoutes');
const app = express();

app.use(express.json());

app.use(cors({ credentials: true, origin: process.env.APP_URL}));

app.use(express.static('public'));

app.use('/users', UserRoutes);
app.use('/pets', PetRoutes);

app.listen(5000, () => console.log('App running on port 5000'));