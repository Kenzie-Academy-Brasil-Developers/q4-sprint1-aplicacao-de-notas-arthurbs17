import express from 'express';
import { v4 as uuid4 } from 'uuid';

const app = express();
const PORT = 3000;

app.use(express.json());

const USERS = [];

// MIDDLEWARES

const getUserByCpf = (req, res, next) => {
  const { cpf } = req.params;
  const user = USERS.find((u) => u.cpf === cpf);

  if (!user) {
    return res.status(404).json({ error: 'user is not registered' });
  }

  return next();
};

const checkCpf = (req, res, next) => {
  const { cpf } = req.body;

  const check = USERS.some((user) => user.cpf === cpf);

  if (check) {
    return res.status(422).json({ error: 'user already exists' });
  }

  return next();
};

const checkExistsUuid = (req, res, next) => {
  const { cpf, uuid } = req.params;
  const { notes } = USERS.find((user) => user.cpf === cpf);

  const verifyNote = notes.some((note) => note.uuid === uuid);

  if (!verifyNote) {
    return res.status(404).json({ error: 'not is not registered' });
  }

  return next();
};

// USERS ROUTES

app.post('/users', checkCpf, (req, res) => {
  const data = req.body;
  const newUser = {
    id: uuid4(),
    name: data.name,
    cpf: data.cpf,
    notes: [],
  };

  USERS.push(newUser);
  return res.status(201).json(newUser);
});

app.get('/users', (_, res) => res.status(200).json(USERS));

app.patch('/users/:cpf', getUserByCpf, (req, res) => {
  const { cpf } = req.params;
  const data = req.body;
  const user = USERS.find((u) => u.cpf === cpf);

  for (let key in data) {
    user[key] = data[key];
  }

  return res.status(200).json({ message: 'User is updated', user });
});

app.delete('/users/:cpf', getUserByCpf, (req, res) => {
  const { cpf } = req.params;

  const user = USERS.find((u) => u.cpf === cpf);

  USERS.pop(user);

  return res.status(204).json({});
});

// NOTES ROUTES

app.post('/users/:cpf/notes', getUserByCpf, (req, res) => {
  const { cpf } = req.params;
  const data = req.body;

  const user = USERS.find((u) => u.cpf === cpf);

  data.uuid = uuid4();
  data.created_at = new Date(Date.now());

  user.notes.push(data);

  return res
    .status(201)
    .json({ message: `${data.title} was added into ${user.name}'s notes` });
});

app.get('/users/:cpf/notes', checkCpf, (req, res) => {
  const { cpf } = req.params;
  const user = USERS.find((u) => u.cpf === cpf);

  return res.status(200).json(user.notes);
});

app.patch(
  '/users/:cpf/notes/:uuid',
  getUserByCpf,
  checkExistsUuid,
  (req, res) => {
    const { cpf, uuid } = req.params;
    const data = req.body;
    const { notes } = USERS.find((user) => user.cpf === cpf);
    const note = notes.find((n) => n.uuid === uuid);

    for (let key in data) {
      note[key] = data[key];
    }

    note.updated_at = new Date(Date.now());

    return res.status(200).json({ note });
  }
);

app.delete(
  '/users/:cpf/notes/:uuid',
  getUserByCpf,
  checkExistsUuid,
  (req, res) => {
    const { cpf, uuid } = req.params;
    const { notes } = USERS.find((user) => user.cpf === cpf);
    const note = notes.find((n) => n.uuid === uuid);

    notes.pop(note);

    return res.status(204).json({});
  }
);

app.listen(PORT, () => console.log(`APP is running on port ${PORT}`));
