//this is the backend of phonebook
//..\part2\phonebook>
require("dotenv").config();
const express = require("express");
const app = express();
const Person = require("./models/person");
const morgan = require("morgan");
const cors = require("cors");

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
  Person.countDocuments({}, function (err, count) {
    const info = `<h1>Phonebook has info for ${count} people</h1>
    <h1>${new Date()}</h1>`;
    res.send(info);
  });
});

app.post("/api/persons", morgan(":body"), (request, response, next) => {
  const body = request.body;
  // if (!body.name) {
  //   return response.status(400).json({
  //     error: "name missing",
  //   });
  // } else if (!body.number) {
  //   return response.status(400).json({
  //     error: "number missing",
  //   });
  // } else {
  Person.find({ name: body.name }).then((twin) => {
    if (twin[0]) {
      return response.status(400).json({
        error: "name must be unique",
      });
    } else {
      const person = new Person({
        name: body.name,
        number: body.number || false,
        date: new Date(),
      });
      person
        .save()
        .then((savedPerson) => {
          response.json(savedPerson);
        })
        .catch((error) => next(error));
    }
  });
});

app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

app.delete("/api/persons/:id", (request, response, next) => {
  console.log(request.params.id);
  Person.findByIdAndRemove(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.get("/api/persons/:id", (request, response) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (request, response, next) => {
  const { name, number } = request.body;
  console.log(request.body);

  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: "query" }
  )
    .then((updatedPerson) => {
      console.log(updatedPerson);
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response
      .status(400)
      .json({ error: error.message, name: error.name });
  }

  next(error);
};

// this has to be the last loaded middleware.
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
