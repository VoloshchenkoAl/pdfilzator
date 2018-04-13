const express = require('express');
const bodyParse = require('body-parser');
const ejs = require('ejs');
const app = express();
const fs = require('fs');
const puppeteer = require('puppeteer');

app.use(express.static('public'));
app.use(bodyParse.json());

const readFile = filePath => new Promise( (resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) reject(err);
        else resolve(data)
    });
});

let pdfTemplate;

app.post('/renderPdf', async (req, res) => {
    const { body } = req;
    if (!pdfTemplate) {
        pdfTemplate = await readFile('./templates/docs.ejs');
    }
    const htmlToPdfString = ejs.render(pdfTemplate, body);
    let file;
    await puppeteer.launch().then( async browser => {
        const page = await browser.newPage();
        await page.setContent(htmlToPdfString);
        await page.emulateMedia('screen');
        file = await page.pdf({format: 'A4'});
        await browser.close();
    });
    
    res.send(file);
});

app.listen(3000, () => {console.log('start app')});