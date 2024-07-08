const express = require('express');
const amqp = require('amqplib');
const { DateTime } = require('luxon');
const axios = require('axios');

const app = express();
const exchange = 'apuestas_exchange_fanout';

const usuarios = [
  { username: 'Luis Cardenas', saldo: 500 },
  { username: 'Ernesto Gaspar', saldo: 500 },
  { username: 'L Phant', saldo: 500 }
  // Agrega más usuarios aquí si es necesario
];

app.use(express.json());

async function conectarRabbitMQ() {
  const conn = await amqp.connect('amqp://game_api:game_api@localhost');
  const channel = await conn.createChannel();

  await channel.assertExchange(exchange, 'fanout', { durable: true });

  return channel;
}

function obtenerSaldo(usuario) {
  const usuarioEncontrado = usuarios.find(u => u.username === usuario);
  return usuarioEncontrado ? usuarioEncontrado.saldo : null;
}

async function verificarEstadoUserApi() {
  try {
    const respuesta = await axios.get('http://localhost:3001/estado');
    return respuesta.data.estado === 'activo';
  } catch (error) {
    console.error('Error al verificar el estado de user_api:', error.message);
    return false;
  }
}

app.post('/apostar', async (req, res) => {
  const { partido, montoApostado, usuario } = req.body;
  const timestamp = DateTime.local().setZone('America/Lima').toFormat('yyyy-MM-dd HH:mm:ss');

  const usuarioExistente = usuarios.find(u => u.username === usuario);
  if (!usuarioExistente) {
    console.log(`Usuario ${usuario} no encontrado`);
    return res.status(404).send('Usuario no encontrado');
  }

  if (usuarioExistente.saldo < montoApostado) {
    console.log(`Usuario ${usuario} sin saldo suficiente`);
    return res.status(403).send('Usuario sin saldo suficiente');
  }

  const channel = await conectarRabbitMQ();
  const apuesta = { partido, montoApostado, usuario, timestamp };

  try {
    const userApiActivo = await verificarEstadoUserApi();

    if (userApiActivo) {
      console.log(`Apuesta enviada directamente: Usuario: ${usuario}, Partido: ${partido}, Monto: ${montoApostado}, Hora: ${timestamp}`);
      usuarioExistente.saldo -= montoApostado;
      console.log(`Saldo restante para ${usuario}: ${usuarioExistente.saldo}`);
      res.send('Apuesta realizada directamente');
    } else {
      console.log(`Apuesta enviada a la cola: Usuario: ${usuario}, Partido: ${partido}, Monto: ${montoApostado}, Hora: ${timestamp}`);
      await channel.publish(exchange, '', Buffer.from(JSON.stringify(apuesta)), { persistent: true });
      usuarioExistente.saldo -= montoApostado;
      console.log(`Saldo restante para ${usuario}: ${usuarioExistente.saldo}`);
      res.send('Apuesta encolada para procesamiento futuro');
    }
  } catch (error) {
    console.error('Error al procesar la apuesta:', error.message);
    res.status(500).json({ error: 'Error al procesar la apuesta' });
  }
});

app.listen(3000, () => {
  console.log('GAME_api escuchando en el puerto 3000');
});
