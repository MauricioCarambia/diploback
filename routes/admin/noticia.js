var express = require('express');
var router = express.Router();
var noticiasModels = require('../../models/noticiasModels');
var util = require('util');
var cluodinary = require('cloudinary').v2;
const uploader = util.promisify(cluodinary.uploader.upload);
const destroy = util.promisify(cluodinary.uploader.destroy);


/* GET home page. */
router.get('/', async function (req, res, next) {
    var noticias = await noticiasModels.getNoticias();

    noticias = noticias.map(noticias => {
        if (noticias.img_id) {
            const imagen = cluodinary.image(noticias.img_id, {
                width: 100,
                height: 100,
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

    res.render('admin/noticia', {
        layout: 'admin/layout',
        persona: req.session.nombre,
        noticias
    });
});

router.get('/agregar', (req, res, next) => {
    res.render('admin/agregar', {
        layout: 'admin/layout'
    });
});

router.post('/agregar', async (req, res, next) => {
    try {

        var img_id = '';
        if (req.files && Object.keys(req.files).length > 0) {
            imagen = req.files.imagen;
            img_id = (await uploader(imagen.tempFilePath)).public_id;
        }

        if (req.body.titulo != "" && req.subtitulo != "" && req.body.cuerpo != "") {
            await noticiasModels.insertNoticia({
                ...req.body,
                img_id
            });
            res.redirect('/admin/noticia');
        } else {
            res.render('admin/agregar', {
                layout: 'admin/layout',
                error: true, message: 'Todos los campos deben ser completados'
            })
        }
    } catch (error) {
        console.log(error)
        res.render('admin/agregar', {
            layout: 'admin/layout',
            error: true,
            message: 'No se cargo la noticia'
        });
    }
});

router.get('/eliminar/:id', async (req, res, next) => {
    var id = req.params.id;
    let noticias = await noticiasModels.getNoticiasById(id);
    if (noticias.img_id) {
        await (destroy(noticias.img_id));
    }
    await noticiasModels.eliminarNoticiaById(id);
    res.redirect('/admin/noticia');
});

router.get('/editar/:id', async (req, res, next) => {
    var id = req.params.id;
    var noticia = await noticiasModels.getNoticiasById(id);

    res.render('admin/editar', {
        layout: 'admin/layout',
        noticia
    });
});

router.post('/editar', async (req, res, next) => {
    try {
        let img_id = req.body.img_original;
        let borrar_img_vieja = false;

        if (req.body.img_delete === "1") {
            img_id = null;
            borrar_img_vieja = true;
        } else {
            if (req.files && Object.keys(req.files).length > 0) {
                imagen = req.files.imagen;
                img_id = (await uploader(imagen.tempFilePath)).public_id;
                borrar_img_vieja = true;
            }
        }
        if (borrar_img_vieja && req.body.img_original) {
            await (destroy(req.body.img_original));
        }

        var obj = {
            titulo: req.body.titulo,
            subtitulo: req.body.subtitulo,
            cuerpo: req.body.cuerpo,
            img_id
        }
        await noticiasModels.editarNoticiaById(obj, req.body.id);
        res.redirect('/admin/noticia');
    } catch (error) {
        res.render('admin/editar', {
            layout: 'admin/layout',
            error: true,
            massage: "No se modifico la noticia"
        })
    }
})

module.exports = router;