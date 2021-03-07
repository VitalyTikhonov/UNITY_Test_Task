const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  country: String,
  city: String,
  name: String,
  location: { ll: [Number] },
  longitude: Number,
  latitude: Number,
  studentCountDifference: Number,
  students: [{ year: Number, number: Number }],
  seconds: [{ difference: Number }],
});

module.exports = mongoose.model('organization', organizationSchema);
