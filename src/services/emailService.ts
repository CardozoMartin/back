import transporter from '../config/nodemailer';
import { ICart } from '../models/Cart';

class EmailService {
    // Enviar correo cuando se crea un pedido
    async sendOrderCreatedEmail(cart: ICart) {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: cart.email,
            subject: 'Pedido Creado',
            html: `
                <h1>¡Gracias por tu pedido!</h1>
                <p>Tu pedido ha sido creado con éxito. Aquí están los detalles:</p>
                <ul>
                    <li><strong>Dirección:</strong> ${cart.direccion}</li>
                    <li><strong>Teléfono:</strong> ${cart.telefono}</li>
                    <li><strong>Productos:</strong></li>
                    <ul>
                        ${cart.productos.map(
                            (item) => `
                            <li>${item.productoId} - Cantidad: ${item.cantidad}</li>
                        `
                        ).join('')}
                    </ul>
                </ul>
                <p>El estado actual de tu pedido es: <strong>${cart.estado}</strong></p>
            `,
        };

        await transporter.sendMail(mailOptions);
    }

    // Enviar correo cuando el pedido es aceptado
    async sendOrderAcceptedEmail(cart: ICart) {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: cart.email,
            subject: 'Pedido Aceptado',
            html: `
                <h1>¡Tu pedido ha sido aceptado!</h1>
                <p>Estamos preparando tu pedido. Aquí están los detalles:</p>
                <ul>
                    <li><strong>Dirección:</strong> ${cart.direccion}</li>
                    <li><strong>Teléfono:</strong> ${cart.telefono}</li>
                    <li><strong>Productos:</strong></li>
                    <ul>
                        ${cart.productos.map(
                            (item) => `
                            <li>${item.productoId} - Cantidad: ${item.cantidad}</li>
                        `
                        ).join('')}
                    </ul>
                </ul>
                <p>El estado actual de tu pedido es: <strong>${cart.estado}</strong></p>
            `,
        };

        await transporter.sendMail(mailOptions);
    }

    // Enviar correo cuando el pedido es cancelado
    async sendOrderCancelledEmail(cart: ICart) {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: cart.email,
            subject: 'Pedido Cancelado',
            html: `
                <h1>Lo sentimos, tu pedido ha sido cancelado.</h1>
                <p>Aquí están los detalles del pedido cancelado:</p>
                <ul>
                    <li><strong>Dirección:</strong> ${cart.direccion}</li>
                    <li><strong>Teléfono:</strong> ${cart.telefono}</li>
                    <li><strong>Productos:</strong></li>
                    <ul>
                        ${cart.productos.map(
                            (item) => `
                            <li>${item.productoId} - Cantidad: ${item.cantidad}</li>
                        `
                        ).join('')}
                    </ul>
                </ul>
                <p>El estado actual de tu pedido es: <strong>${cart.estado}</strong></p>
            `,
        };

        await transporter.sendMail(mailOptions);
    }

    // Enviar correo cuando el pedido es entregado
    async sendOrderDeliveredEmail(cart: ICart) {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: cart.email,
            subject: 'Pedido Entregado',
            html: `
                <h1>¡Tu pedido ha sido entregado!</h1>
                <p>Gracias por comprar con nosotros. Aquí están los detalles:</p>
                <ul>
                    <li><strong>Dirección:</strong> ${cart.direccion}</li>
                    <li><strong>Teléfono:</strong> ${cart.telefono}</li>
                    <li><strong>Productos:</strong></li>
                    <ul>
                        ${cart.productos.map(
                            (item) => `
                            <li>${item.productoId} - Cantidad: ${item.cantidad}</li>
                        `
                        ).join('')}
                    </ul>
                </ul>
                <p>El estado actual de tu pedido es: <strong>${cart.estado}</strong></p>
            `,
        };

        await transporter.sendMail(mailOptions);
    }
}

export default new EmailService();