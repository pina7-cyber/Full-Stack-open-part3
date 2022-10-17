const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log(
    'Please provide the password as an argument: node mongo.js <password>'
  )
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://phonebook:${password}@phonebook.teryphu.mongodb.net/phonebook?retryWrites=true&w=majority`

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
  date: Date,
})

const Person = mongoose.model('Person', personSchema)

mongoose.connect(url).then(() => {
  console.log('connected')
  if (process.argv.length === 3) {
    Person.find({})
      .then((result) => {
        console.log('phonebook:')
        result.forEach((person) => {
          console.log(`${person.name} ${person.number}`)
        })
        mongoose.connection.close()
      })
      .catch((err) => console.log(err))
  } else if (process.argv.length === 4) {
    console.log('Please provide additional Data')
    mongoose.connection.close()
  } else {
    const note = new Person({
      name: process.argv[3],
      number: process.argv[4],
      date: new Date(),
    })
    note
      .save()
      .then((result) => {
        console.log(
          `added ${result.name} number ${result.number} to phonebook`
        )
        mongoose.connection.close()
      })
      .catch((err) => console.log(err))
  }
})
