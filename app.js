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
async function modifyOrganizations() {
  try {
    let docs = await Organization.aggregate()
    /* вариант lookup с pipeline */
    .lookup({
        /* смотрит в другую коллекцию */
        from: 'countries',
        /* объявляет переменную country, записывая в нее значение из документа текущей коллекции Organization ('$country') */
        let: {
          country: '$country',
        },
        pipeline: [
          /* выбирает документы из коллекции countries, в которых поле country ('$country') соответствуют переменной '$$country' */
          {
            $match: {
              /* чтобы в match обращаться к переменным из let, нужно обернуть в $expr: (если, кроме match, тут еще правила,
                в них $expr не нужно) */
              $expr: {
                $eq: ['$$country', '$country'],
              },
            },
          },
          /* из отобранного документа из countries выкидываем ненужные поля */
          {
            $project: {
              _id: false,
              overallStudents: true,
            },
          },
        ],
        as: 'overallStudents',
      }) // УКАЗАТЬ ПРАВИЛЬНОЕ ЗАКРЫТИЕ
      /* в документе Organization оказывается свойство overallStudents: [ { overallStudents: 1000 } ], т. к. lookup пишет
      в массив и только в него */

      /* Распаковываем
      overallStudents: [ { overallStudents: 1000 } ]
      в
      overallStudents: { overallStudents: 1000 }
      (оно почему-то доступно для дальнейшей обработки, но не остается в документе, хотя в последующем project я его не удаляю)*/
      .unwind('$overallStudents')
      .project({
        /* указываем, какие поля перенести из оригинального (1/true) или удалить (0/false) */
        country: true,
        city: true,
        name: true,
        location: true,
        students: true,
        seconds: true,
        /* создаем новые поля */
        longitude: { $arrayElemAt: ['$location.ll', 0] },
        latitude: { $arrayElemAt: ['$location.ll', 1] },
        studentCountDifference: {
          /* вычитаем... */
          $subtract: [
            /* ...из overallStudents – как в ТЗ – что странно, так как это число во многих случаях оказывается меньше второго
            и результат – отрицательное,.. */
            '$overallStudents.overallStudents',
            /* ...сумму "current students count": */
            {
              /* проходимся по массиву students, суммируя поля number */
              $reduce: {
                input: '$students',
                initialValue: 0,
                in: { $add: ['$$value', '$$this.number'] },
              },
            },
          ],
        },
      }) // УКАЗАТЬ ПРАВИЛЬНОЕ ЗАКРЫТИЕ
      // }); // УКАЗАТЬ ПРАВИЛЬНОЕ ЗАКРЫТИЕ
      /* Сохраняем результат в БД с помощью out: */
      .out({ db: 'unity', coll: 'organizations' });
    // .out("organizations"); // возможно?
    // console.log('docs', docs[2]);
  } catch (err) {
    console.log('err', err);
  }
}

async function executeMyProgram() {
  // await writeCountries();
  // await writeOrganizations();
  modifyOrganizations();
}

executeMyProgram();

const app = express();

app.use(express.json());
app.listen(PORT, () => {
  console.log(`Сервер запущен, порт: ${PORT}`);
});
