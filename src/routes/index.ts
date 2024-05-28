import express, { Response } from 'express';

import index from './builders';
import form, { formPost } from './builders/form';
import adminBlog, { blogPost } from './builders/admin_blog';
import { checkoutPostStep1, checkoutPostStep2, checkoutStep1, checkoutStep2 } from './builders/checkout';
import blog from './builders/blog';
import picture from './builders/picture';
import formsDownload, { downloadFormsPost } from './builders/forms-download';
import getRules from './builders/rules';
import hosting from './builders/hosting';
import fish from './builders/fish';

import simplePage from './builders/simplePage';
import prices from './builders/prices';
import { adminLogin, adminLoginPost, adminRoot } from './builders/admin';
import noscript from './builders/noscript';
import tournament from './builders/tournament';


const router = express.Router();

router.get('/', index);


const closed =  simplePage('closed', 'Inscripciones cerradas');

router.get('/registro', closed);
router.get('/costos', closed);

router.get('/registro/formulario', closed);
router.get('/registro/subir_recibo', closed);
router.get('/registro/subir_recibo', closed);


// router.get('/registro', simplePage('register', 'Registro para el evento'));
// router.get('/costos', prices);

// router.get('/registro/formulario', form);
// router.post('/registro/formulario', formPost);

// router.get('/registro/subir_recibo', checkoutStep1);
// router.post('/registro/subir_recibo', checkoutPostStep1);
// router.get('/registro/subir_recibo/:form_id', checkoutStep2);
// router.post('/registro/subir_recibo/:form_id', checkoutPostStep2);


router.get('/blog/:id', blog);
router.get('/picture/:id', picture);


router.get('/calendarios/congreso', simplePage('wip', 'Calendario del congreso'));
router.get('/calendarios/robotica', simplePage('calendar/robotics', 'Calendarios del evento de robótica'));


router.get('/congreso/convocatoria', simplePage('congress/convocation', 'Convocatoria'));
router.get('/congreso/formatos', simplePage('congress/formats', 'Formatos'));

router.get('/reglas/carrera_de_insectos',      getRules('carrera_de_insectos.pdf',      'CARRERA DE INSECTOS'));
router.get('/reglas/microsumo',                getRules('microsumo.pdf',                'MICROSUMO'));
router.get('/reglas/minisumo_autonomo',        getRules('minisumo_autonomo.pdf',        'MINISUMO AUTÓNOMO'));
router.get('/reglas/minisumo_radiocontrol',    getRules('minisumo_radiocontrol.pdf',    'MINISUMO RADIOCONTROL'));
router.get('/reglas/sumo_3kg_autonomo',        getRules('sumo_3kg_autonomo.pdf',        'SUMO 3KG. AUTÓNOMO'));
router.get('/reglas/sumo_3kg_radio_control',   getRules('sumo_3kg_radio_control.pdf',   'SUMO 3KG. RADIO CONTROL'));
router.get('/reglas/robotica_de_aplicacion',   getRules('robotica_de_aplicacion.pdf',   'ROBÓTICA DE APLICACIÓN'));
router.get('/reglas/carrera_de_drones',        getRules('carrera_de_drones.pdf',        'CARREA DE DRONES'));
router.get('/reglas/seguidor_de_linea',        getRules('seguidor_de_linea.pdf',        'SEGUIDOR DE LÍNEA'));
router.get('/reglas/soccer',                   getRules('soccer.pdf',                   'SOCCER'));
router.get('/reglas/guerra_de_robots',         getRules('guerra_de_robots.pdf',         'GUERRA DE ROBOTS'));
router.get('/reglas/minisumo_radiocontrol_jr', getRules('minisumo_radiocontrol_jr.pdf', 'MINISUMO RADIO CONTROL JR.'));
router.get('/reglas/carrera_de_insectos_jr',   getRules('carrera_de_insectos_jr.pdf',   'CARREA DE INSECTOS JR.'));

router.get('/actividades', simplePage('wip', 'Programa de actividades'));

router.get('/hospedajes/hotel_fiesta_inn', hosting('hotel_fiesta_inn.pdf', 'HOTEL FIESTA INN'));
router.get('/hospedajes/hotel_paris',      hosting('hotel_paris.pdf',      'PARIS FC HOTEL'));
router.get('/hospedajes/hotel_pozarica',   hosting('hotel_pozarica.pdf',   'HOTEL POZA RICA'));
router.get('/hospedajes/hotel_victoria',   hosting('hotel_victoria.pdf',   'HOTEL VICTORIA'));
router.get('/hospedajes/hotel_marel',      hosting('hotel_marel.pdf',      'HOTEL MAREL'));


router.all('/fish', fish);
router.all('/noscript', noscript);


router.get('/admin/publish', adminBlog);
router.post('/admin/publish', blogPost);

router.get('/admin/download', formsDownload);
router.post('/admin/download', downloadFormsPost);

router.get(adminRoot, adminLogin);
router.post(adminRoot, adminLoginPost);
router.get(`${adminRoot}/panel`, adminLogin);



router.get('/torneos/combate_1_libra',          tournament('Combate 1 Libra',          '9ut2gnu8wb'));
router.get('/torneos/combate_3_libras',         tournament('Combate 3 Libras',         'yerqzebigs'));
router.get('/torneos/combate_12_libras',        tournament('Combate 12 Libras',        'zqaa4au51y'));
router.get('/torneos/carrera_de_insectos',      tournament('Carrera de Insectos',      'rxix7tgzny'));
router.get('/torneos/microsumo',                tournament('Microsumo',                'bk1tj2ir0o'));

router.get('/torneos/minisumo_autonomo_1',     tournament('Minisumo Autónomo 1',     'gfinalahnz'));
router.get('/torneos/minisumo_autonomo_2',     tournament('Minisumo Autónomo 2',     'wdbqv2zhxf'));
router.get('/torneos/minisumo_radiocontrol_1', tournament('Minisumo Radiocontrol 1', 'svrjzqlwog'));
router.get('/torneos/minisumo_radiocontrol_2', tournament('Minisumo Radiocontrol 2', 'v2vummilcw'));
router.get('/torneos/soccer',                   tournament('Soccer',                   '2qhecf1j4j'));
router.get('/torneos/velocistas',               tournament('Velocistas',               'w0dzvm3ogc'));




// Handle redirects

function redirect(path: string)
{
	return (_: any, res: Response) => res.redirect(path);
}


router.all('/register', redirect('/registro'));
router.all('/form', redirect('/registro/formulario'));
router.all('/checkout', redirect('/registro/subir_recibo'));

router.all('/rules', redirect('/reglas/carrera_de_insectos'));

router.all('/calendar/congress', redirect('/calendarios/congreso'));
router.all('/calendar/robotics', redirect('/calendarios/robotica'));

router.all('/activities', redirect('/actividades'));

router.all('/congress/convocation', redirect('/congreso/convocatoria'));
router.all('/congress/formats', redirect('/congreso/formatos'));

router.all('/hosting', redirect('/hospedajes/hotel_fiesta_inn'));


export default router;
