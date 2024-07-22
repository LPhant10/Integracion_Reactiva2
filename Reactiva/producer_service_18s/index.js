const express = require('express');
const { from } = require('rxjs');
const { map, delay } = require('rxjs/operators');

const app = express();
const port = 3000; // Puerto 3000

// Array de objetos con ID y nombres
const data = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
    { id: 3, name: 'Charlie' },
    { id: 4, name: 'David' },
    { id: 5, name: 'Eve' }
];

//Características:

   // Utiliza rxjs/operators.map para transformar cada usuario en data.
   // Usa rxjs/operators.delay para simular una operación asíncrona de 18 segundos 
   // por cada usuario.
  //  Espera a que todas las operaciones terminen antes de enviar la respuesta.

app.get('/data', (req, res) => {
  const startTime = Date.now(); // Tiempo de inicio del procesamiento

  const dataObservable = from(data).pipe(
    map(user => {
      console.log(`Procesando usuario: ${user.name}`);
      return { ...user, processed: true }; // Agregando una propiedad 'processed' a cada objeto
    }),
    delay(18000)  // Simulando una operación asíncrona con 18 segundos de demora
  );

  let processedData = [];

  dataObservable.subscribe({
    next: value => {
      processedData.push(value);
    },
    complete: () => {
      const endTime = Date.now(); // Tiempo de finalización del procesamiento
      const duration = endTime - startTime; // Duración total del procesamiento en milisegundos

      console.log(`Procesamiento completo en ${duration} ms.`);
      res.json(processedData);
    }
  });
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
