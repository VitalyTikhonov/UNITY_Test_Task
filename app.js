const express = require('express');
const mongoose = require('mongoose');
const Organization = require('./models/organization');
const Country = require('./models/country');
const organizations = require('./data/first.json');
const countries = require('./data/second.json');

const { PORT, DATABASE_ADDRESS } = require('./configs/config');

mongoose.connect(DATABASE_ADDRESS, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

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

async function writeOrganizations() {
  try {
    const writeResult = await Organization.bulkWrite(
      organizations.map((organizaton) => {
        return {
          insertOne: {
            document: organizaton,
          },
        };
      }),
    );
    console.log('Organization writeResult.insertedCount', writeResult.insertedCount);
  } catch (err) {
    console.log('err', err);
  }
}

async function modifyOrganizations() {
  try {
    // const filter = { city: 'West Harmony' };
    // let docs = await Organization.aggregate([{ $match: filter }]);

    // console.log('docs.length', docs.length); // 1
    // console.log('docs[0].name', docs[0].name); // 'Jean-Luc Picard'

    // let docs = await Organization.aggregate([
    //   {
    //     $group: {
    //       // Each `_id` must be unique, so if there are multiple
    //       // documents with the same age, MongoDB will increment `count`.
    //       _id: '$students',
    //       count: { $students: 1 }
    //     }
    //   }
    // ]);

    // console.log('docs.length', docs.length);
    // console.log('docs', docs);

    let docs = await Organization.aggregate()
      // .lookup({ from: 'countries', localField: 'country', foreignField: 'country', as: 'countryMatched' })
      .project({
        country: 1,
        city: 1,
        name: 1,
        location: 1,
        longitude: { $arrayElemAt: ['$location.ll', 0] },
        latitude: { $arrayElemAt: ['$location.ll', 1] },
        students: 1,
        seconds: 1,
      })
    .out({ db: "unity", coll : "organizations" });
    // .out("organizations");
    // .lookup({
    //   from: 'countries',
    //   let: { order_item: '$item', order_qty: '$ordered' },
    //   pipeline: [{ $match: { $expr: { $and: [{ $eq: ['$stock_item', '$$order_item'] }, { $gte: ['$instock', '$$order_qty'] }] } } }, { $project: { stock_item: 0, _id: 0 } }],
    //   as: 'stockdata',
    // });
    console.log('docs', docs);
  } catch (err) {
    console.log('err', err);
  }
}

async function executeMyProgram() {
  await writeOrganizations();
  modifyOrganizations();
}

executeMyProgram();

const app = express();

app.use(express.json());
app.listen(PORT, () => {
  console.log(`Сервер запущен, порт: ${PORT}`);
});
