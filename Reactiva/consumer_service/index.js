const express = require('express');
const axios = require('axios');
const { from } = require('rxjs');
const { mergeMap } = require('rxjs/operators');

const app = express();
const port = process.env.PORT || 5000; // Puerto 5000

// Endpoint para consumir datos de producer_service_18s y producer_service_3s simultáneamente
app.get('/consume-data', async (req, res) => {
    try {
        const startTime = Date.now();

        // Realizar las peticiones a ambos servicios simultáneamente
        const [data18s, data3s] = await Promise.all([
            axios.get('http://localhost:3000/data'), // Cambiar el puerto a 3000 para producer_service_18s
            axios.get('http://localhost:4000/data')  // Cambiar el puerto a 4000 para producer_service_3s
        ]);

        const data18sResponse = data18s.data;
        const data3sResponse = data3s.data;

        console.log('Received data from producer_service_18s:', data18sResponse);
        console.log('Received data from producer_service_3s:', data3sResponse);

        // Procesar datos del producer_service_18s
        let processedData18s = [];
        for (let i = 0; i < data18sResponse.length; i++) {
            const currentTime = Date.now();
            const delay = currentTime - startTime;
            processedData18s.push({ ...data18sResponse[i], delay });
            console.log(`Processed data from producer_service_18s: ${JSON.stringify({ ...data18sResponse[i], delay })}`);
        }

        // Procesar datos del producer_service_3s con integración reactiva
        const dataObservable3s = from(data3sResponse).pipe(
            mergeMap(async user => {
                const processStartTime = Date.now();
                console.log(`Processing user from producer_service_3s: ${user.name}`);
                return new Promise(resolve => {
                    setTimeout(() => {
                        const currentTime = Date.now();
                        const delay = currentTime - processStartTime;
                        resolve({ ...user, processed: true, delay });
                    }, Math.random() * 3000); // Simulando una operación asíncrona con hasta 3 segundos de demora
                });
            })
        );

        let processedData3s = [];
        dataObservable3s.subscribe({
            next: value => {
                processedData3s.push(value);
                const totalDelay = Date.now() - startTime;
                console.log(`Processed data from producer_service_3s: ${JSON.stringify({ ...value, totalDelay })}`);
            },
            complete: () => {
                console.log('Processing complete for producer_service_3s.');
                // Combinar resultados de ambos servicios para enviar la respuesta
                const combinedData = {
                    producer_service_18s: processedData18s,
                    producer_service_3s: processedData3s
                };
                res.json(combinedData);
            }
        });

    } catch (error) {
        console.error('Error consuming data:', error);
        res.status(500).send('Error consuming data');
    }
});

app.listen(port, () => {
    console.log(`Consumer service running on port ${port}`);
});
