const express = require('express')
const bodyParse = require('body-parser')
const app = express();
const adminRoute = require('./routes/admin');
const userRoute = require('./routes/user');
const cros = require('cors');
const paymentRoute = require('./routes/payment');
const cron = require('node-cron');
const { Bus, Seats } = require('./model/bus-model');
const moment = require('moment')

app.use(bodyParse.json())
app.use(bodyParse.urlencoded({ extended: true }))
app.use(cros());
app.use(adminRoute);
app.use(userRoute);
// app.use(paymentRoute);

cron.schedule('* * * * *', async () => {
  const currentDate = moment();
  const query = { boardingTime: { $lt: currentDate } };
  const buses = await Bus.find(query);
  const deleteResult = await Bus.deleteMany(query);

  for (const doc of buses) {
    const id = doc._id;
    const deleteSeats = await Seats.deleteMany({ bus: id });
  }
});
app.listen(8080, () => {
  console.log("Listening to port", 8000);
});

module.exports = app;
