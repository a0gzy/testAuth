const { Schema, model } = require('mongoose')

const schema = new Schema({
  userId: String,
  guilds: [
      {
          name: String,
          gid: String,
      }
  ]
})

module.exports = model('HykModel', schema)