//this is the backend of phonebook
require("dotenv").config();
const express = require("express");
const app = express();
const Person = require("./models/person");
const morgan = require("morgan");
const cors = require("cors");

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.use(express.json());
app.use(cors());
app.use(express.static("build"));

morgan.token("body", function (req, res) {
  return JSON.stringify(req.body);
});

app.use(morgan("tiny"));

app.get("/", (req, res) => {
  res.send("<h1>Hello World!</h1>");
});

app.get("/info", (req, res) => {
  const info = `<h1>Phonebook has info for ${persons.length} people</h1>
    <h1>${new Date()}</h1>`;
  res.send(info);
});

app.post("/api/persons", morgan(":body"), (request, response) => {
  const body = request.body;
  if (!body.name) {
    return response.status(400).json({
      error: "name missing",
    });
  } else if (!body.number) {
    return response.status(400).json({
      error: "number missing",
    });
  } else {
    Person.find({ name: body.name }).then((twin) => {
      if (twin[0]) {
        console.log(`name ${twin[0].name} already exists`);
        return response.status(400).json({
          error: "name must be unique",
        });
      } else {
        const person = new Person({
          name: body.name,
          number: body.number || false,
        });
        person.save().then((savedPerson) => {
          response.json(savedPerson);
        });
      }
    });
  }
});

app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id);

  response.status(204).end();
});

app.get("/api/persons/:id", (request, response) => {
  Person.findById(request.params.id).then((person) => {
    response.json(person).catch((err) => response.status(404).end());
  });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
