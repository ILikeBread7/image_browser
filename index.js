const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  const url = req.query.url;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Image browser${url ? ` - ${url}` : ''}</title>
      </head>
      <body>
        ${url ? `
        <img src="https://cdn-ak.f.st-hatena.com/images/fotolife/h/hetiyaborake/20190414/20190414025221.png"/>
        <hr>` : ''}
        <form>
          <input name="url"/>
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