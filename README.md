
# 1. Corremos este comando con el Docker abierto para crear el Contenedor

docker run -d -p 15672:15672 -p 5672:5672 --name some-rabbit rabbitmq:3-management

# 2. Ingresamos a RABBITMQ en la web

username: guest
password: guest


# 3. Ejecutar los Servicios

abrir 2 terminales en simultaneo: game_api, user_api y otro_servicio y colocamos el siguiente comando.

node index.js

# 5. Pruebas en POSTMAN

> Crea una nueva solicitud POST. 
> En la URL, ingresa http://localhost:3000/apostar 
> Haz clic en la pestaña "Body" debajo de la URL. 
> Selecciona "raw" y elige el formato "JSON" en el menú desplegable a la derecha. 
> En el área de texto, ingresa el siguiente JSON:

    {
      "partido": "Equipo A vs Equipo B",
      "montoApostado": 50,
      "usuario": "Luis Cardenas"
    }

> Haz clic en el botón "Send" para enviar la solicitud.

# 6. Pruebas en Postman con Colas

 apagamos el servicio de user_api, pero dejar corriendo  game_api, enviar apuestas, luego activar de nuevo el servicio de user_api
 tienen que entrar las apuestas enviadas y decir "apuesta recibida" de las que se encontraban en cola.

 Las apuestas enviadas en cola se pueden observar en RABBITMQ. > Queues and Streams

link http://localhost:3000/apostar 
link http://localhost:3001/users 
