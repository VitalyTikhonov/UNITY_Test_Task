const mongoose = require('mongoose');

const countrySchema = new mongoose.Schema({
  country: String,
  overallStudents: Number,
});

module.exports = mongoose.model('country', countrySchema);
