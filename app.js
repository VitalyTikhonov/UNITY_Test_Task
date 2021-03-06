const express = require('express');
const mongoose = require('mongoose');
const Organization = require('./models/organization');
const Country = require('./models/country');
const organizatons = require('./data/first.json');
const countries = require('./data/second.json');

const { PORT, DATABASE_ADDRESS } = require('./configs/config');

mongoose.connect(DATABASE_ADDRESS, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

// const db = mongoose.connection;
// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', function() {
//   // we're connected!
//   console.log('Hooray!');
// });

// console.log('organizatons', organizatons);

// Organization.insertMany(organizatons);
// Country.insertMany(countries);

/* For each document from the first collection, find document from the second collection by country respectively and count
difference between overall students count and current students count (in the current document from first collection) and write
result to the current document as separated field */

// Country.bulkWrite(
//   countries.map((countryEntry) => {
//     // const { country } = countryEntry;

//     return {
//       insertOne: {
//         document: { ...countryEntry },
//       },
//     };
//   }),
// )
//   .then((success) => console.log('Country success.insertedCount', success.insertedCount))
//   .catch((err) => console.log('err', err));

//////////////////////////////////////////////////////////
const getSize = readStream => {
  return new Promise(function (resolve, reject) {
  gm(readStream).size({ bufferStream: true }, function (err, size) {
    if (err) reject(err);
    else resolve(size);
  })
});
}


// let printSize = async readStream => {
// console.log(`Size is ${await getSize(readStream)}`);
// }

//////////////////////////////////////////////////////////

function processCountries() {
  return organizatons.map((organizaton) => {
    const {
      location: { ll },
      ...rest
    } = organizaton;

    // const country = await Country.findOne({ country: organizaton.country }, 'overallStudents').exec();
    // const overallStudentCount = country.overallStudents;
    // console.log('overallStudentCount', overallStudentCount)

    const currentStudentCount = organizaton.students.reduce((acc, item) => acc + item.number, 0);
    // let studentCountDifference = overallStudentCount - currentStudentCount;
    return {
      insertOne: {
        document: {
          ...rest,
          longitude: ll[0],
          latitude: ll[1],
          // studentCountDifference,
        },
      },
    };
  });
}

console.log('processCountries', processCountries());

// Organization.bulkWrite(processCountries())
//   .then((success) => console.log('Organization success.insertedCount', success.insertedCount))
//   .catch((err) => console.log('err', err));

const app = express();

app.use(express.json());
app.listen(PORT, () => {
  console.log(`Сервер запущен, порт: ${PORT}`);
});
