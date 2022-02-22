const { Schema, model } = require('mongoose')

const schema = new Schema({
  userId: String,
  guilds: [
      {
        id: String,
        name: String,
        icon: String,
        owner: Boolean,
        permissions: String,
        features: Array,
        permissions_new: String
      }
  ]
})

module.exports = model('HykModel', schema)