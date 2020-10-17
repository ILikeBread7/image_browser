const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = Number(process.env.PORT || 3000);

app.get('/', async (req, res) => {
  const url = (req.query.url || '').toString();
  const width = Number(req.query.width || 1920);
  const height = Number(req.query.height || 1080);
  const offset = Number(req.query.offset || 0);
  const scale = Number(req.query.scale || 1);
  let error;

  const image = url ? (await (async () => {
    try {
      const browser = await puppeteer.launch(
        process.env.PORT  // for Heroku
        ? {
          args: ['--no-sandbox']
        }
        : {}
      );
      const page = await browser.newPage();
      await page.setViewport({ width, height, deviceScaleFactor: scale });
      await page.goto(url, { waitUntil: 'networkidle2' });

      if (offset) {
        await page.evaluate(offset => {
          window.scrollTo(0, offset);
        }, offset);
      }

      const result = await page.screenshot({ encoding: 'base64' });
    
      await browser.close();
      return result;
    } catch (ex) {
      error = ex;
    }
  })()) : undefined;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Image browser${url ? ` - ${url}` : ''}</title>
      </head>
      <body>
        ${error ? `<p style="color:red;">${error}</p>` : ''}
        ${image ? `
        <img src="data:image/png;base64,${image}"/>
        ` : ''}
        <form>
          Url: <input name="url" value="${url}"/><br>
          Width: <input name="width" value="${width}"/><br>
          Height: <input name="height" value="${height}""/><br>
          Offset: <input name="offset" value="${offset}""/><br>
          Scale: <input name="scale" value="${scale}""/><br>
          <input type="submit" value="Show"/>
        </form>
      </body>
    </html>
  `;

  res.send(html);
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
})