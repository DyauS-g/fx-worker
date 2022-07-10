const axios = require('axios');
const cheerio = require('cheerio');
const cron = require('node-cron');

const mongoose = require('mongoose');
const FxData = require('./model');

/* It's a URL of the website you want to crawl. */
const url = 'https://www.investing.com/currencies/streaming-forex-rates-majors';

/**
 * It takes a URL as an argument, makes a request to that URL, and returns the response
 * @param url - The URL of the website you want to crawl.
 * @returns The response object is being returned.
 */
async function fetchData(url) {
  console.log('[app]: Crawling data...');
  let response = await axios(url).catch((err) => console.log(err));

  if (response.status !== 200) {
    console.error('[app]: Error occurred while fetching data');
    return;
  }
  return response;
}

/**
 * It's fetching the data from the url, iterating through each table row and grabbing the text from
 * each table data element, creating an object with the data from the table and pushing it into an
 * array, connecting to the database, removing all the documents from the collection, and inserting the
 * data into the database
 * @returns An array of objects.
 */
async function scrape() {
  const res = await fetchData(url);
  let dataArr = [];

  const html = res.data;
  const $ = cheerio.load(html);
  const statsTable = $('table.genTbl > tbody > tr');

  /* The above code is iterating through each table row and grabbing the text from each table data
    element. */
  statsTable.each(function () {
    /* Iterating through each table data element and grabbing the text from each table data element. */
    let tData = $(this)
      .find('td')
      .map(function () {
        return $(this).text();
      })
      .filter((el) => el)
      .get();

    /* Creating an object with the data from the table and pushing it into an array. */
    const obj = {
      pair: tData[0],
      bid: tData[1],
      ask: tData[2],
      high: tData[3],
      low: tData[4],
      change: tData[5],
      changeProc: tData[6],
      time: tData[7],
    };

    dataArr = [...dataArr, obj];
  });

  /* Connecting to the database. */
  await mongoose.connect('mongodb://localhost:27017/test', {
    bufferCommands: false,
  });

  /* Removing all the documents from the collection. */
  await FxData.deleteMany({});

  /* Inserting the data into the database. */
  const a = await FxData.insertMany(dataArr);

  if (!a.length) {
    console.error('[app]: Error occurred while inserting data');
  }
}

cron.schedule('*/3 * * * * *', scrape);
