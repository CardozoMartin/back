import transporter from '../config/nodemailer';
import { ICart } from '../models/Cart';

class EmailService {
    // Template base para todos los correos
    private getEmailTemplate(title: string, content: string, cart: ICart) {
        return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 8px;">
            <div style="background-color: #004aad; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Bahía ACC</h1>
            </div>
            
            <div style="padding: 20px; background-color: #ffffff;">
                <h2 style="color: #004aad; text-align: center;">${title}</h2>
                ${content}
                
                <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 6px;">
                    <h3 style="color: #004aad; margin-top: 0;">Detalles del Pedido:</h3>
                    <p style="margin: 5px 0;"><strong>📍 Dirección:</strong> ${cart.direccion}</p>
                    <p style="margin: 5px 0;"><strong>📱 Teléfono:</strong> ${cart.telefono}</p>
                    <p style="margin: 5px 0;"><strong>📧 Email:</strong> ${cart.email}</p>
                    <p style="margin: 5px 0;"><strong>🔄 Estado:</strong> ${cart.estado}</p>
                    ${cart.estadoPedido ? `<p style="margin: 5px 0;"><strong>📦 Estado del Pedido:</strong> ${cart.estadoPedido}</p>` : ''}
                </div>
    
                <div style="margin-top: 20px;">
                    <h3 style="color: #004aad;">Productos:</h3>
                    <div style="border: 1px solid #e1e1e1; border-radius: 6px; padding: 10px;">
                        ${cart.productos.map(item => `
                            <div style="display: flex; align-items: center; padding: 10px; border-bottom: 1px solid #e1e1e1;">
                                <img src="${item.imagen}" alt="${item.nombre}" style="width: 50px; height: 50px; margin-right: 10px; border-radius: 5px;">
                                <p style="margin: 5px 0;">
                                    <strong>🛍️ Producto:</strong> ${item.nombre} <br>
                                    <strong>📊 Cantidad:</strong> ${item.cantidad}
                                </p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
    
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; text-align: center; margin-top: 20px;">
                <p style="color: #6c757d; margin: 0;">Gracias por confiar en Bahía ACC</p>
            </div>
        </div>
        `;
    }
    

    // Enviar correo cuando se crea un pedido
    async sendOrderCreatedEmail(cart: ICart) {
        const content = `
            <p style="font-size: 16px; line-height: 1.5; color: #333;">
                ¡Gracias por realizar tu pedido con Bahía ACC! 🎉
                <br><br>
                Hemos recibido tu pedido y lo estamos procesando. Te mantendremos informado sobre el estado del mismo.
                <br><br>
                A continuación encontrarás los detalles de tu pedido:
            </p>
        `;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: cart.email,
            subject: '¡Gracias por tu pedido! - Bahía ACC',
            html: this.getEmailTemplate('¡Pedido Recibido!', content, cart)
        };

        await transporter.sendMail(mailOptions);
    }

    // Enviar correo cuando el pedido es aceptado
    async sendOrderAcceptedEmail(cart: ICart) {
        const content = `
            <p style="font-size: 16px; line-height: 1.5; color: #333;">
                ¡Buenas noticias! Tu pedido ha sido aceptado y está siendo procesado. 🎊
                <br><br>
                Nuestro equipo está trabajando para preparar tus productos con el mayor cuidado.
                <br><br>
                Te mantendremos informado sobre el progreso de tu pedido.
            </p>
        `;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: cart.email,
            subject: '¡Tu pedido ha sido aceptado! - Bahía ACC',
            html: this.getEmailTemplate('¡Pedido Aceptado!', content, cart)
        };

        await transporter.sendMail(mailOptions);
    }

    // Enviar correo cuando el pedido está en camino
    async sendOrderInTransitEmail(cart: ICart) {
        const content = `
            <p style="font-size: 16px; line-height: 1.5; color: #333;">
                ¡Tu pedido está en camino! 🚚
                <br><br>
                Nuestro equipo de entrega está llevando tus productos a la dirección proporcionada.
                <br><br>
                Pronto estarás disfrutando de tu compra. Te notificaremos cuando el pedido haya sido entregado.
            </p>
        `;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: cart.email,
            subject: '¡Tu pedido está en camino! - Bahía ACC',
            html: this.getEmailTemplate('¡En Camino!', content, cart)
        };

        await transporter.sendMail(mailOptions);
    }

    // Enviar correo cuando el pedido es cancelado
    async sendOrderCancelledEmail(cart: ICart) {
        const content = `
            <p style="font-size: 16px; line-height: 1.5; color: #333;">
                Lamentamos informarte que tu pedido ha sido cancelado. 😔
                <br><br>
                Si tienes alguna pregunta sobre la cancelación o necesitas ayuda para realizar un nuevo pedido,
                no dudes en contactarnos.
                <br><br>
                Esperamos poder atenderte pronto nuevamente.
            </p>
        `;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: cart.email,
            subject: 'Pedido Cancelado - Bahía ACC',
            html: this.getEmailTemplate('Pedido Cancelado', content, cart)
        };

        await transporter.sendMail(mailOptions);
    }

    // Enviar correo cuando el pedido es entregado
    async sendOrderDeliveredEmail(cart: ICart) {
        const content = `
            <p style="font-size: 16px; line-height: 1.5; color: #333;">
                ¡Tu pedido ha sido entregado exitosamente! 🎉
                <br><br>
                Esperamos que disfrutes de tus productos y que hayan cumplido con tus expectativas.
                <br><br>
                Gracias por confiar en Bahía ACC. ¡Esperamos verte pronto nuevamente!
            </p>
        `;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: cart.email,
            subject: '¡Pedido Entregado! - Bahía ACC',
            html: this.getEmailTemplate('¡Entrega Exitosa!', content, cart)
        };

        await transporter.sendMail(mailOptions);
    }
    async sendPaymentReceivedEmail(cart: ICart) {
        const content = `
            <p style="font-size: 16px; line-height: 1.5; color: #333;">
                ¡Hemos recibido tu pago exitosamente! 🎉
                <br><br>
                Tu pedido está siendo procesado y te mantendremos informado sobre su progreso.
                <br><br>
                Gracias por confiar en Bahía ACC. ¡Esperamos que disfrutes de tus productos!
            </p>
        `;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: cart.email,
            subject: '¡Pago Recibido! - Bahía ACC',
            html: this.getEmailTemplate('¡Pago Recibido!', content, cart)
        };

        await transporter.sendMail(mailOptions);
    }

    // Enviar correo cuando el pedido está pendiente de pago por transferencia
    async sendPendingPaymentEmail(cart: ICart, bankDetails: { bankName: string, accountNumber: string, accountHolder: string }) {
        const content = `
            <p style="font-size: 16px; line-height: 1.5; color: #333;">
                Gracias por realizar tu pedido con Bahía ACC. 🎉
                <br><br>
                Tu pedido está pendiente de pago por transferencia bancaria. A continuación, te proporcionamos los datos para realizar la transferencia:
                <br><br>
                <strong>🏦 Banco:</strong> ${bankDetails.bankName}<br>
                <strong>🔢 Número de Cuenta:</strong> ${bankDetails.accountNumber}<br>
                <strong>👤 Titular de la Cuenta:</strong> ${bankDetails.accountHolder}
                <br><br>
                Una vez realizado el pago, por favor envíanos el comprobante de transferencia a este correo o a nuestro WhatsApp para procesar tu pedido.
                <br><br>
                Si tienes alguna duda, no dudes en contactarnos.
            </p>
        `;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: cart.email,
            subject: 'Pedido Pendiente de Pago - Bahía ACC',
            html: this.getEmailTemplate('Pedido Pendiente de Pago', content, cart)
        };

        await transporter.sendMail(mailOptions);
    }

}

export default new EmailService();