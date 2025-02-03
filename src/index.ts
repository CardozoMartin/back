
import dotenv from 'dotenv';

import { connectDB } from './config/db';
import Server from './server/Server';


//Funcion principoal que maneja la conexion de la base de datos y luego inicia el servidor

const iniciarServer = async () => {
    await connectDB();
    dotenv.config();

    const server = new Server();

    server.listen()
}

iniciarServer();