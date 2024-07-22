const express = require('express');
const { from } = require('rxjs');
const { map, mergeMap } = require('rxjs/operators');

const app = express();
const port = 4000; // Puerto 4000

// Array de objetos con ID y nombres
const data = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Charlie' },
  { id: 4, name: 'David' },
  { id: 5, name: 'Eve' }
];


//Características:

  //  Utiliza rxjs/operators.mergeMap para manejar cada usuario de manera reactiva.
  //  Usa setTimeout dentro de mergeMap para simular una operación asíncrona con un 
  //  tiempo de demora aleatorio de hasta 3 segundos por cada usuario.
  //  Envía cada resultado a medida que está disponible, sin esperar a que todos los
  //  usuarios terminen de procesarse.



app.get('/data', (req, res) => {
  const startTime = Date.now(); // Tiempo de inicio del procesamiento

  const dataObservable = from(data).pipe(
    mergeMap(user => {
      const processStartTime = Date.now();
      console.log(`Processing user: ${user.name}`);
      return new Promise(resolve => {
        setTimeout(() => {
          const currentTime = Date.now();
          const delay = currentTime - processStartTime;
          resolve({ ...user, processed: true, delay });
        }, Math.random() * 3000); // Simulando una operación asíncrona con hasta 3 segundos de demora
      });
    })
  );

  let processedData = [];

  dataObservable.subscribe({
    next: value => {
      processedData.push(value);
      const totalDelay = Date.now() - startTime;
      console.log(`Processed data: ${JSON.stringify({ ...value, totalDelay })}`);
      res.write(JSON.stringify({ ...value, totalDelay }) + "\n");
    },
    complete: () => {
      console.log('Processing complete.');
      res.end();
    }
  });
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});

