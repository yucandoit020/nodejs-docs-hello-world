// ***************************************************************************
// Bank API code from Web Dev For Beginners project
// https://github.com/microsoft/Web-Dev-For-Beginners/tree/main/7-bank-project/api
// ***************************************************************************

 const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const port = process.env.PORT || 3000;
const apiPrefix = '/api';

const db = {
  test: {
    user: 'test',
    currency: '$',
    description: 'Test account',
    balance: 75,
    transactions: [
      { id: '1', date: '2020-10-01', object: 'Pocket money', amount: 50 },
      { id: '2', date: '2020-10-03', object: 'Book', amount: -10 },
      { id: '3', date: '2020-10-04', object: 'Sandwich', amount: -5 }
    ]
  },
  jondoe: {
    user: 'jondoe',
    currency: '$',
    description: 'Second test account',
    balance: 150,
    transactions: [
      { id: '1', date: '2022-10-01', object: 'Gum', amount: -2 },
      { id: '2', date: '2022-10-03', object: 'Book', amount: -10 },
      { id: '3', date: '2022-10-04', object: 'Restaurant', amount: -45 }
    ]
  }
};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
  res.status(200).send('Hello World!');
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.get('/api', (req, res) => {
  res.status(200).send('Fabrikam Bank API');
});

const router = express.Router();

router.post('/accounts', (req, res) => {
  if (!req.body.user || !req.body.currency) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  if (db[req.body.user]) {
    return res.status(409).json({ error: 'User already exists' });
  }

  let balance = req.body.balance;
  if (balance && typeof balance !== 'number') {
    balance = parseFloat(balance);
    if (isNaN(balance)) {
      return res.status(400).json({ error: 'Balance must be a number' });
    }
  }

  const account = {
    user: req.body.user,
    currency: req.body.currency,
    description: req.body.description || `${req.body.user}'s budget`,
    balance: balance || 0,
    transactions: []
  };

  db[req.body.user] = account;
  return res.status(201).json(account);
});

router.get('/accounts/:user', (req, res) => {
  const account = db[req.params.user];
  if (!account) {
    return res.status(404).json({ error: 'User does not exist' });
  }
  return res.json(account);
});

router.delete('/accounts/:user', (req, res) => {
  const account = db[req.params.user];
  if (!account) {
    return res.status(404).json({ error: 'User does not exist' });
  }

  delete db[req.params.user];
  return res.sendStatus(204);
});

router.post('/accounts/:user/transactions', (req, res) => {
  const account = db[req.params.user];
  if (!account) {
    return res.status(404).json({ error: 'User does not exist' });
  }

  if (!req.body.date || !req.body.object || req.body.amount === undefined) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  let amount = req.body.amount;
  if (typeof amount !== 'number') {
    amount = parseFloat(amount);
  }

  if (isNaN(amount)) {
    return res.status(400).json({ error: 'Amount must be a number' });
  }

  const id = crypto
    .createHash('md5')
    .update(req.body.date + req.body.object + req.body.amount)
    .digest('hex');

  if (account.transactions.some((transaction) => transaction.id === id)) {
    return res.status(409).json({ error: 'Transaction already exists' });
  }

  const transaction = {
    id,
    date: req.body.date,
    object: req.body.object,
    amount
  };

  account.transactions.push(transaction);
  account.balance += transaction.amount;

  return res.status(201).json(transaction);
});

router.delete('/accounts/:user/transactions/:id', (req, res) => {
  const account = db[req.params.user];
  if (!account) {
    return res.status(404).json({ error: 'User does not exist' });
  }

  const transactionIndex = account.transactions.findIndex(
    (transaction) => transaction.id === req.params.id
  );

  if (transactionIndex === -1) {
    return res.status(404).json({ error: 'Transaction does not exist' });
  }

  account.transactions.splice(transactionIndex, 1);
  return res.sendStatus(204);
});

app.use(apiPrefix, router);

app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on port ${port}`);
});
