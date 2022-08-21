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
  const networkidle0 = req.query.networkidle0;
  const sleep = Number(req.query.sleep || 0);
  let error;

  const image = url ? (await (async () => {
    try {
      const browser = await puppeteer.launch(
        process.env.PORT  // for Heroku
        ? {
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
          ]
        }
        : {}
      );
      const page = await browser.newPage();
      await page.setViewport({ width, height, deviceScaleFactor: scale });
      await page.goto(url, { waitUntil: networkidle0 ? 'networkidle0' : 'networkidle2' });

      if (sleep) {
        await new Promise(r => setTimeout(r, sleep));
      }

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
      <body style="margin: 0px;">
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
          Sleep: <input name="sleep" value="${sleep}""/><br>
          <label>Networkidle0: <input name="networkidle0" type="checkbox" ${networkidle0 ? 'checked' : ''}/></label>
          <input type="submit" value="Show"/>
        </form>
      </body>
    </html>
  `;

  res.send(html);
});

app.get('/twitter/:user', (req, res) => {
  const user = req.params.user;

  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Twitter - ${user}</title>
      </head>
      <body style="margin: 0px; background-color: #292F33;">
        <a class="twitter-timeline" data-dnt="true" data-theme="dark" href="https://twitter.com/${user}?ref_src=twsrc%5Etfw">Tweets by ${user}</a> <script src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
      </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
})