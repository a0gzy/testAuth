const { Router } = require('express')
const HykModel = require('../models/HykModel')

const fetch = require('node-fetch');
const { clientId,clientSecret,port} = require('../config.json');
const redirect = 'http://localhost:50451/callback';

const cookieParser = require('cookie-parser');
const { db } = require('../models/HykModel');
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

router.get('/servers', async (req, res) => {
  try {
    let userid = req.cookies.userid

    //const hyks = await HykModel.find({})
    const hyks = await HykModel.findOne({ userId: userid })
    if (hyks == null) {
      return res.redirect('/')
    }
    const gilds = await hyks.guilds

    //console.log(gilds)

    res.render('servers', {
      title: 'Server list',
      isServers: true,
      hyks: gilds
    })
  } catch (error) {
    console.error(error);
  }
})

/* router.get('/servers/',async (req, res) => {
  let userid = req.cookies.userid

  //const hyks = await HykModel.find({})
  const hyks = await HykModel.findOne({userId: userid})
  const gilds = hyks.guilds

  //console.log(gilds)
 
  res.render('servers', {
    title: 'Server list',
    hyks: gilds
  })
}) */

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
     // console.log(oauthData);

      let userResult = await fetch('https://discord.com/api/users/@me', {
        headers: {
          authorization: `${oauthData.token_type} ${oauthData.access_token}`,
        },
      });

      userResult = await userResult.json()

     // console.log(userResult);

      const userGuildsResult = await fetch('https://discord.com/api/users/@me/guilds', {
        headers: {
          authorization: `${oauthData.token_type} ${oauthData.access_token}`,
        },
      });

      guilds = await userGuildsResult.json();
      //console.log(guilds)

      let userid = userResult.id

      //Cookie
      res.cookie('userid', userid)

      const inBase = await HykModel.findOne({ userId: userid })
      if (inBase) {
        await HykModel.updateOne({ userId: userid }, { $set: { guilds: guilds } })
      } else {
        const hyk = new HykModel({
          userId: userid,
          guilds: guilds
        })
        // console.log(hyk)
        await hyk.save()
      }
  
     /*  const inBase = await HykModel.findOne({ userId: userid })
      await inBase.remove();
      const hyk = new HykModel({
        userId: userid,
        guilds: guilds
      })
      await hyk.save()
 */

      res.redirect('/servers')
    } catch (error) {
      console.error(error);
    }
  }
});



router.post('/back', async (req, res) => {

  res.redirect('/servers')
})

router.post('/edit', async (req, res) => {
  try {
    //console.log(req.body)
    
    const hyks = await HykModel.findOne({id:req.body.id })
    //console.log(hyks)
    let gui
    for (let guild in hyks.guilds) {
      if(hyks.guilds[guild].id == req.body.id){
        gui = hyks.guilds[guild]
        //console.log(gui)
      }
    }

    //res.redirect('/'+hyks)
   // console.log(hyks)
     res.render('edit', {
      title: 'Edit Server',
      guild: gui
    }) 
  } catch (error) {
    console.error(error);
  }

  //res.redirect('/')
}) 

module.exports = router