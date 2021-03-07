const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  country: String,
  city: String,
  name: String,
  students: [{ year: Number, number: Number }],
  seconds: [{ difference: Number }],
  location: { ll: [Number] },
  longitude: Number,
  latitude: Number,
  studentCountDifference: Number,
});

module.exports = mongoose.model('organization', organizationSchema);
