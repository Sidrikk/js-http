import fastify from "fastify";
import formbody from '@fastify/formbody';
import cookie from '@fastify/cookie';
import { Chance } from 'chance';
import stream from 'stream';
import auth from 'basic-auth';

const chance = new Chance();

export const server = () => {
  const app = fastify();

  app.register(formbody);
  app.register(cookie);

  app.server.keepAliveTimeout = 5;

  app.get('/hello', (req, res) => {
    res.send('You\'ve done!');
  });

  app.get("/about", (req, res) => {
    res.header("Connection", "close");
    const data = "You've done!";
    res.send(`${data}\n`);
  });

  app.post('/upload', (req, res) => {
    if (req.body !== 'my request body') {
      res.code(422).send();
    }

    res.send(req.body);
  });

  app.post('/session/new', (req, res) => {
    res.header('Connection', 'close');
    let text;
    if (req.body.username === 'admin' && req.body.password === 'secret') {
      text = "You've done!";
    } else {
      res.status(422);
      text = 'wrong password or username';
    }

    res.send(text);
  });

  app.get('/stream', (req, res) => {
    res.header('Transfer-Encoding', 'chunked');
    res.header('Connection', 'close');

    // Create a buffer to hold the response chunks
    const buffer = new stream.Readable();
    buffer._read = () => {}; // eslint-disable-line

    // Generate 10 chunks with 100 interval
    let count = 10;
    const emit = () => {
      const data = chance.sentence();
      buffer.push(data);

      count -= 1;
      if (count > 0) {
        setTimeout(emit, 100);
      } else {
        buffer.push(null);
      }
    };

    emit();
    res.type('text/html').send(buffer);
  });

  app.get('/query', (req, res) => {
    const { query } = req;
    if (query.key === 'value' && query.another_key === 'another_value') {
      res.send("You've done!");
    } else {
      res.status(404);
      res.send();
    }
    res.header('Connection', 'close');
  });

  app.post('/docs', (req, res) => {
    res.header('Connection', 'close');
    res.redirect('/');
  });

  app.get('/admin', (req, res) => {
    res.header('Connection', 'close');
    const credentials = auth(req);
    if (!credentials || credentials.name !== 'Aladdin' || credentials.pass !== 'open sesame') {
      res.status(401);
      res.header('WWW-Authenticate', "Basic realm='Admin Panel'");
      res.send('Access denied\n');
    } else {
      res.send('Access granted\n');
    }
  });

  app.get('/account', (req, res) => {
    res.header('Connection', 'close');

    if (req.cookies.secret === 'secret_hash' && req.cookies.name === 'user') {
      res.status(200);
    } else {
      res.status(403);
    }
    res.send();
  });

  return app;

};

export default server;
