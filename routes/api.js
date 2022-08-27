var express = require('express');
var router = express.Router();
var noticiasModels = require('./../models/noticiasModels');
var cluodinary = require('cloudinary').v2;
var nodemailer = require('nodemailer')

router.get('/noticias', async function (req, res, next) {
    let noticias = await noticiasModels.getNoticias();

    noticias = noticias.map(noticias => {
        if (noticias.img_id) {
            const imagen = cluodinary.url(noticias.img_id, {
                width: 960,
                height: 300,
                crop: 'fill'
            });
            return {
                ...noticias,
                imagen
            }
        } else {
            return {
                ...noticias,
                imagen: ''
            }
        }
    });
    res.json(noticias);
});

router.post('/contactanos', async (req, res) => {
    const mail = {
        to: 'mcarambia@gmail.com',
        subject: 'Contacto web',
        html: `${req.body.nombre} se contacto a traves de la web y quiere mas informacion a este correo: ${req.body.email} <br> Ademas, hizo el siguiente comentario: ${req.body.mensaje} <br> Su tel es: ${req.body.telefono}`
    }

    var transport = nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: "4d5280dd9d0048",
            pass: "7e45389ed58ef4"
        }
    });

    await transport.sendMail(mail)

    res.status(201).json({
        error: false,
        message: 'Mensaje enviado'
    });
});
module.exports = router;