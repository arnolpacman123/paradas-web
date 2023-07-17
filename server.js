import express from 'express';
import { join } from 'path';

const app = express();

app.use(express.static(__dirname + '/dist/paradas_web'));
app.get('/*', function(req, res) {
  res.sendFile(join(__dirname + '/dist/paradas_web/index.html'));
});

app.listen(process.env.PORT || 4200);
