const fs = require('fs');
const cheerio = require('cheerio');

const inputFilePath = './file/index.html'; // path of the HTML file to extract translations from
const outputHtmlFilePath = './file/updated-index.html'; // path of the updated HTML file 
const translationFilePath = './file/es.json'; // path of the translation file

// Load HTML file
const htmlContent = fs.readFileSync(inputFilePath, 'utf-8');
const $ = cheerio.load(htmlContent, { xmlMode: false, decodeEntities: false });

// Object to hold translations
const translations = {};

function sanitizeKey(text) {
  return text.replace(/\s+/g, '_').toLowerCase().replace(/[^a-z0-9_]/g, '');
}

// function to extract text and replace with translation key
function extractAndReplaceText(element) {
  element.contents().each(function () {
    if (this.type === 'text') {
      const text = $(this).text().trim();
      if (text && !/\{\{.*?\}\}/.test(text)) { // ignore Angular variables
        const key = sanitizeKey(text);
        translations[key] = text;
        $(this).replaceWith(`{{ '${key}' | translate }}`);
      }
    } else if (this.type === 'tag') {
      extractAndReplaceText($(this)); // use $(this) to correctly handle nested elements
    }
  });
}

// extract and replace text for specific elements
$('body').find('*').each(function () {
  extractAndReplaceText($(this));
});

// write the updated HTML to a new file
fs.writeFileSync(outputHtmlFilePath, $.html(), 'utf-8');

//write the translations to a JSON file
fs.writeFileSync(translationFilePath, JSON.stringify(translations, null, 2), 'utf-8');

console.log('Translation extraction and HTML update completed.');