var fetch = require('node-fetch');
var fs = require('fs');

const {
  buildClientSchema,
  introspectionQuery,
  printSchema,
} = require('graphql/utilities');
const chalk = require('chalk');

function isURL(str) {
  var urlRegex =
    '^(?!mailto:)(?:(?:http|https|ftp)://)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$';
  var url = new RegExp(urlRegex, 'i');
  return str.length < 2083 && url.test(str);
}

let url = process.argv[3] || process.argv[2];

console.log(url);
var argv = require('minimist')(process.argv.slice(2), { boolean: true });

argv._.forEach(command => {
  if (isURL(command)) url = command;
});

if (url === 'get-schema') url = null;

const saveJson = argv.json === true;

if (!url) {
  console.log(
    'Usage: get-schema ' + chalk.yellow('[--json] ') + chalk.green('url')
  );
  console.log('  ' + chalk.green('url') + ' is your graphql server address');
  console.log(
    '  ' +
      chalk.yellow('--json') +
      ' is an optional flag that  will download your schema in json'
  );
  process.exit();
}

if (!isURL(url)) {
  console.log(chalk.red(url) + ' is not a valid url');
  process.exit(1);
}

console.log('Downloading for url: ' + chalk.green(url));

fetch(url, {
  method: 'POST',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query: introspectionQuery }),
})
  .then(res => res.json())
  .then(res => {
    console.log('schema.graphql has downloaded and saved');
    if (saveJson) {
      const jsonString = JSON.stringify(res.data);
      console.log('schema.json has been saved');
      fs.writeFileSync('schema.json', jsonString);
    }
    const schemaString = printSchema(buildClientSchema(res.data));
    fs.writeFileSync('schema.graphql', schemaString);
  })
  .catch(e => {
    console.log(chalk.red('\nError:'));
    console.error(e);
    process.exit(1);
  });
