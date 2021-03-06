const axios = require('axios');
const cheerio = require('cheerio');
const cron = require('node-cron');

const url = 'https://www.iban.com/exchange-rates';

async function fetchData(url) {
  console.log('Crawling data...');
  let response = await axios(url).catch((err) => console.log(err));

  if (response.status !== 200) {
    console.log('Error occurred while fetching data');
    return;
  }
  return response;
}

function formatStr(arr, dataObj) {
  let regExp = /[^A-Z]*(^\D+)/;
  let newArr = arr[0].split(regExp);
  dataObj[newArr[1]] = newArr[2];
}

async function scrape() {
  fetchData(url).then((res) => {
    const html = res.data;
    const $ = cheerio.load(html);
    let dataObj = new Object();
    const statsTable = $(
      '.table.table-bordered.table-hover.downloads > tbody > tr'
    );
    statsTable.each(function () {
      let title = $(this).find('td').text();
      let newStr = title.split('\t');
      newStr.shift();
      formatStr(newStr, dataObj);

      console.log(dataObj);
    });
  });
}

cron.schedule('*/10 * * * * *', scrape);
