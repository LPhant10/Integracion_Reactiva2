// Programación Reactiva
const axios = require("axios");
const { Observable, forkJoin } = require("rxjs");
const { catchError } = require("rxjs/operators");

const peopleAPIUrl = "http://localhost:3000/api";
const policeAPIUrl = "http://localhost:3001/api";
const dni = '4376602'; // DNI de ejemplo

const express = require('express');
const app = express();
const port = 4000; // Puerto para el nuevo endpoint

// Endpoint para combinar datos de people-api y police-api
app.get('/api/comedor', (req, res) => {
    // Registrar el tiempo de inicio
    const startTime = new Date();

    // Crear observables para las solicitudes a people-api y police-api
    const peopleRequest$ = axios.get(`${peopleAPIUrl}/people/${dni}`);
    const policeRequest$ = axios.get(`${policeAPIUrl}/police/${dni}`);

    // Combinar las respuestas de ambas solicitudes
    forkJoin([peopleRequest$, policeRequest$]).pipe(
        catchError(error => {
            console.error('Error al obtener datos', error);
            return [];
        })
    ).subscribe({
        next: ([peopleResponse, policeResponse]) => {
            // Registrar el tiempo de fin
            const endTime = new Date();
            const duration = endTime - startTime; // Calcular la duración en milisegundos

            const combinedData = {
                people: peopleResponse.data,
                police: policeResponse.data,
                duration: `${duration} ms` // Agregar el tiempo de ejecución a la respuesta
            };
            res.json(combinedData); // Enviar la respuesta combinada como JSON
        },
        error: err => {
            console.error('Error en la suscripción', err);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    });
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor obu-api corriendo en http://localhost:${port}`);
});
