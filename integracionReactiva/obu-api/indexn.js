// Programación Secuencial
const axios = require("axios");
const peopleAPIUrl = "http://localhost:3000/api";
const policeAPIUrl = "http://localhost:3001/api";
const dni = '4376602'; // DNI de ejemplo

const express = require('express');
const app = express();
const port = 4000; // Puerto para el nuevo endpoint

// Endpoint para combinar datos de people-api y police-api
app.get('/api/comedor', async (req, res) => {
    try {
        // Registrar el tiempo de inicio
        const startTime = new Date();

        // Realizar la solicitud a people-api de manera secuencial
        const peopleResponse = await axios.get(`${peopleAPIUrl}/people/${dni}`);

        // Realizar la solicitud a police-api de manera secuencial
        const policeResponse = await axios.get(`${policeAPIUrl}/police/${dni}`);

        // Registrar el tiempo de fin
        const endTime = new Date();
        const duration = endTime - startTime; // Calcular la duración en milisegundos

        const combinedData = {
            people: peopleResponse.data,
            police: policeResponse.data,
            duration: `${duration} ms` // Agregar el tiempo de ejecución a la respuesta
        };

        res.json(combinedData); // Enviar la respuesta combinada como JSON
    } catch (error) {
        console.error('Error al obtener datos', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor obu-api corriendo en http://localhost:${port}`);
});
