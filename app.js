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

/* Первичная запись из JSON в базу */
async function writeCountries() {
  try {
    const writeResult = await Country.bulkWrite(
      countries.map((countryEntry) => {
        return {
          insertOne: {
            document: countryEntry,
          },
        };
      }),
    );
    console.log('Country writeResult.insertedCount', writeResult.insertedCount);
  } catch (err) {
    console.log('err', err);
  }
}

/* Первичная запись из JSON в базу */
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

/* Обработка */
async function processData() {
  try {
    let docs = await Organization.aggregate()
      .lookup({
        from: 'countries',
        let: {
          country: '$country', // из текущей коллекции
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$$country', '$country'], // $$ - на переменную из let, то есть из текущей коллекции; $ - на вторую коллекцию
              },
            },
          },
          {
            $project: {
              _id: false,
              overallStudents: true,
            },
          },
        ],
        as: 'overallStudents',
      })
      .unwind('$overallStudents')
      .addFields({
        longitude: { $arrayElemAt: ['$location.ll', 0] },
        latitude: { $arrayElemAt: ['$location.ll', 1] },
        studentCountDifference: {
          $subtract: [
            '$overallStudents.overallStudents',
            {
              $reduce: {
                input: '$students',
                initialValue: 0,
                in: { $add: ['$$value', '$$this.number'] },
              },
            },
          ],
        },
      })
      .group({
        _id: { country: '$country' },
        allDiffs: { $push: '$studentCountDifference' },
        count: { $sum: 1 },
        longitude: { $push: '$longitude' },
        latitude: { $push: '$latitude' },
      })

      .out({ db: 'unity', coll: 'result' });
  } catch (err) {
    console.log('err', err);
  }
}

async function executeMyProgram() {
  await writeCountries();
  await writeOrganizations();
  processData();
}

executeMyProgram();
