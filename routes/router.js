const { Router } = require('express')
const HykModel = require('../models/HykModel')

const fetch = require('node-fetch');
const { clientId,clientSecret,port} = require('../config.json');
const redirect = 'http://localhost:50451/callback';

const cookieParser = require('cookie-parser')
//const cookieParser = require('./index.js')

const router = Router()

router.use(cookieParser())


router.get('/', async (req, res) => {
  //const hyks = await HykModel.find({})

  //console.log(typeof req.cookies.userid)

  res.render('index', {
    title: 'Hyk list',
    isIndex: true,
   // hyks
  }) 
})

router.get('/servers',async (req, res) => {
  let userid = req.cookies.userid

  //const hyks = await HykModel.find({})
  const hyks = await HykModel.findOne({userId: userid})
  const gilds = hyks.guilds

  console.log(gilds)
 
  res.render('servers', {
    title: 'Server list',
    hyks: gilds
  })
})

router.get('/callback', async (req, res) => {
  const code = req.query.code;
  if (code) {

    try {
      const oauthResult = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: redirect,
          scope: 'identify',
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const oauthData = await oauthResult.json();
      console.log(oauthData);

      let userResult = await fetch('https://discord.com/api/users/@me', {
        headers: {
          authorization: `${oauthData.token_type} ${oauthData.access_token}`,
        },
      });

      userResult = await userResult.json()

      console.log(userResult);

      const userGuildsResult = await fetch('https://discord.com/api/users/@me/guilds', {
        headers: {
          authorization: `${oauthData.token_type} ${oauthData.access_token}`,
        },
      });

      guilds = await userGuildsResult.json();

      let userid = userResult.id

      //Cookie
      res.cookie('userid', userid)





      let hyks = []
      for (let guild in guilds) {
        let gild = {
          name: guilds[guild].name,
          gid: guilds[guild].id
        }
        hyks.push(gild)
      }
      // console.log(hyks)
      const inBase = await HykModel.findOne({ userId: userid })
      if (inBase) {
        HykModel.updateOne({ userId: userid }, { $set: { guilds: hyks } })
      } else {
        const hyk = new HykModel({
          userId: userid,
          guilds: hyks
        })
        // console.log(hyk)
        await hyk.save()
      }



      res.redirect('/servers')
    } catch (error) {
      console.error(error);
    }
  }
});

/*
router.post('/create', async (req, res) => {
  const todo = new Todo({
    title: req.body.title
  })

  await todo.save()
  res.redirect('/')
})

router.post('/complete', async (req, res) => {
  const todo = await Todo.findById(req.body.id)

  todo.completed = !!req.body.completed
  await todo.save()

  res.redirect('/')
}) */

module.exports = router