const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');
const { catchAsync } = require('../utils');
const { clientId,clientSecret,port} = require('../config.json');

const router = express.Router();

const redirect = 'http://localhost:50451/api/discord/callback';

let guilds;

router.get('/login', (req, res) => {
  //res.redirect(`https://discord.com/api/oauth2/authorize?client_id=945450005911732304&redirect_uri=http%3A%2F%2Flocalhost%3A50451&response_type=code&scope=identify%20guilds%20email`);
  res.redirect(`https://discord.com/api/oauth2/authorize?client_id=945450005911732304&redirect_uri=http%3A%2F%2Flocalhost%3A50451%2Fapi%2Fdiscord%2Fcallback&response_type=code&scope=identify%20email%20guilds`);
});

router.get('/callback', catchAsync(async (req, res) => {
  if (!req.query.code) throw new Error('NoCodeProvided');
  const code = req.query.code;
  //console.log(code);
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

    //console.log(userResult);

    const userGuildsResult = await fetch('https://discord.com/api/users/@me/guilds', {
      headers: {
        authorization: `${oauthData.token_type} ${oauthData.access_token}`,
      },
    });

    guilds = await userGuildsResult.json();

    let guildstosite;
    for(let guild in guilds){
        let nowg = guilds[guild]
        guildstosite+= nowg.name + ' ' + nowg.id + ','
    }

    let user = {
      name: userResult.username,
      id: userResult.id,
      guilds: guildstosite
    }

    let userjson = JSON.stringify(user)


    /* fs.writeFile('data.json',userjson, (err) => {
      if (err) {
          throw err;
      }
      console.log("JSON data is saved.");
   }); */

    /* for(let guild in guilds){
      let nowg = guilds[guild]
      console.log(nowg.name + ' ' + nowg.id)
    } */
    //console.log(guilds.json);
  
    //response.sendFile(`/?token=${oauthData.access_token}`)
    res.redirect(`/?token=${oauthData.access_token}`);
  } catch (error) {
    // NOTE: An unauthorized token will not throw an error;
    // it will return a 401 Unauthorized response in the try block above
    console.error(error);
  }

}));


module.exports = router;