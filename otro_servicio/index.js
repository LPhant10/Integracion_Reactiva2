const express = require('express');
const amqp = require('amqplib');

const app = express();
const exchange = 'apuestas_exchange_fanout';

let apuestasRecibidas = [];

async function conectarRabbitMQ() {
  const conn = await amqp.connect('amqp://otro_servicio:otro_servicio@localhost');
  const channel = await conn.createChannel();

  await channel.assertExchange(exchange, 'fanout', { durable: true });
  const q = await channel.assertQueue('otro_servicio_queue', { durable: true });  // Cola duradera y nombrada
  await channel.bindQueue(q.queue, exchange, '');

  return { channel, queue: q.queue };
}

async function consumirApuestas() {
  const { channel, queue } = await conectarRabbitMQ();

  channel.consume(queue, (msg) => {
    console.log('Apuesta recibida');
    const apuesta = JSON.parse(msg.content.toString());

    console.log(`Apuesta recibida: ${JSON.stringify(apuesta)}`);
    apuestasRecibidas.push(apuesta);
    channel.ack(msg);
  }, { noAck: false });
}

consumirApuestas();

app.get('/estado', (req, res) => {
  res.json({ estado: 'activo' });
});

app.get('/apuestas', (req, res) => {
  res.json(apuestasRecibidas);
});

app.listen(3002, () => {
  console.log('OTRO_servicio escuchando en el puerto 3002');
});
