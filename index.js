const express = require('express');
const path = require('path');
const { port } = require('./config.json');
const mongoose = require('mongoose');
const exphbs = require('express-handlebars');
const router = require('./routes/router')
//const cookieParser = require('./routes/router')
//const cookieParser = require('cookie-parser')

const app = express();
const hbs = exphbs.create({
  defaultLayout: 'main',
  extname: 'hbs',
  runtimeOptions: {
        allowProtoPropertiesByDefault: true,
          allowProtoMethodsByDefault: true,
        },
})

app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', 'views')

app.use(router)


//app.use(cookieParser())

//module.exports = cookieParser

async function start() {
  try {
    await mongoose.connect(
      'mongodb+srv://a0g:Rocel@cluster0.1zxgb.mongodb.net/users',
      {
        
      }
    )

    app.listen(port, () => {
      console.log(`App listening at http://localhost:${port}`);
    })
  } catch (e) {
    console.log(e)
  }
}

start()


/* app.use(express.static(__dirname + '/js'));

app.get('/', (request, response) => {
  
	//return response.sendFile(`${__dirname}/index.html`);
  return response.sendFile('index.html', { root: '.' });
});

app.use('/api/discord', require('./api/discord'));
 */
