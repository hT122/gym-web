// Nutritional data per 100g: { nombre, categoria, cal, prot, carbs, grasa, porcion (g) }
const ALIMENTOS = [
  // ── CARNES ───────────────────────────────────────────────
  { nombre: 'Pechuga de pollo (cocida)',  categoria: 'Carnes',    cal: 165, prot: 31.0, carbs: 0.0,  grasa: 3.6,  porcion: 100 },
  { nombre: 'Muslo de pollo (cocido)',    categoria: 'Carnes',    cal: 209, prot: 26.0, carbs: 0.0,  grasa: 11.0, porcion: 100 },
  { nombre: 'Ternera (lomo)',             categoria: 'Carnes',    cal: 215, prot: 26.0, carbs: 0.0,  grasa: 12.0, porcion: 100 },
  { nombre: 'Ternera picada (12% grasa)', categoria: 'Carnes',    cal: 196, prot: 20.0, carbs: 0.0,  grasa: 13.0, porcion: 100 },
  { nombre: 'Cerdo (lomo)',               categoria: 'Carnes',    cal: 242, prot: 24.0, carbs: 0.0,  grasa: 16.0, porcion: 100 },
  { nombre: 'Pechuga de pavo',            categoria: 'Carnes',    cal: 135, prot: 30.0, carbs: 0.0,  grasa: 1.0,  porcion: 100 },
  { nombre: 'Jamón ibérico',              categoria: 'Carnes',    cal: 375, prot: 32.0, carbs: 0.0,  grasa: 27.0, porcion: 30  },
  { nombre: 'Jamón de york',              categoria: 'Carnes',    cal: 107, prot: 18.0, carbs: 1.5,  grasa: 3.5,  porcion: 50  },
  { nombre: 'Salchichón',                 categoria: 'Carnes',    cal: 460, prot: 24.0, carbs: 1.0,  grasa: 40.0, porcion: 30  },
  { nombre: 'Chorizo',                    categoria: 'Carnes',    cal: 455, prot: 25.0, carbs: 2.0,  grasa: 38.0, porcion: 30  },

  // ── PESCADOS ─────────────────────────────────────────────
  { nombre: 'Salmón (fresco)',            categoria: 'Pescados',  cal: 208, prot: 20.0, carbs: 0.0,  grasa: 13.0, porcion: 150 },
  { nombre: 'Atún en lata (al natural)', categoria: 'Pescados',  cal: 116, prot: 26.0, carbs: 0.0,  grasa: 1.0,  porcion: 80  },
  { nombre: 'Atún en lata (aceite)',      categoria: 'Pescados',  cal: 198, prot: 25.0, carbs: 0.0,  grasa: 11.0, porcion: 80  },
  { nombre: 'Merluza',                    categoria: 'Pescados',  cal: 86,  prot: 17.0, carbs: 0.0,  grasa: 1.5,  porcion: 150 },
  { nombre: 'Bacalao',                    categoria: 'Pescados',  cal: 82,  prot: 18.0, carbs: 0.0,  grasa: 0.7,  porcion: 150 },
  { nombre: 'Dorada',                     categoria: 'Pescados',  cal: 100, prot: 20.0, carbs: 0.0,  grasa: 2.5,  porcion: 150 },
  { nombre: 'Sardinas en lata',           categoria: 'Pescados',  cal: 208, prot: 25.0, carbs: 0.0,  grasa: 11.0, porcion: 100 },
  { nombre: 'Caballa en lata',            categoria: 'Pescados',  cal: 185, prot: 19.0, carbs: 0.0,  grasa: 12.0, porcion: 100 },
  { nombre: 'Gambas / langostinos',       categoria: 'Pescados',  cal: 99,  prot: 24.0, carbs: 0.0,  grasa: 0.5,  porcion: 100 },

  // ── HUEVOS ───────────────────────────────────────────────
  { nombre: 'Huevo entero (L)',           categoria: 'Huevos',    cal: 155, prot: 13.0, carbs: 1.1,  grasa: 11.0, porcion: 60  },
  { nombre: 'Claras de huevo',            categoria: 'Huevos',    cal: 52,  prot: 11.0, carbs: 0.7,  grasa: 0.2,  porcion: 120 },
  { nombre: 'Huevo duro',                 categoria: 'Huevos',    cal: 155, prot: 13.0, carbs: 1.1,  grasa: 11.0, porcion: 60  },

  // ── LÁCTEOS ──────────────────────────────────────────────
  { nombre: 'Leche entera',               categoria: 'Lácteos',   cal: 61,  prot: 3.2,  carbs: 4.8,  grasa: 3.3,  porcion: 250 },
  { nombre: 'Leche semidesnatada',        categoria: 'Lácteos',   cal: 46,  prot: 3.3,  carbs: 4.7,  grasa: 1.6,  porcion: 250 },
  { nombre: 'Leche desnatada',            categoria: 'Lácteos',   cal: 35,  prot: 3.4,  carbs: 5.0,  grasa: 0.1,  porcion: 250 },
  { nombre: 'Yogur natural',              categoria: 'Lácteos',   cal: 63,  prot: 3.5,  carbs: 4.7,  grasa: 3.3,  porcion: 125 },
  { nombre: 'Yogur 0% grasa',             categoria: 'Lácteos',   cal: 38,  prot: 5.7,  carbs: 4.0,  grasa: 0.1,  porcion: 125 },
  { nombre: 'Yogur griego',               categoria: 'Lácteos',   cal: 115, prot: 6.0,  carbs: 4.0,  grasa: 8.0,  porcion: 150 },
  { nombre: 'Queso fresco (Burgos)',      categoria: 'Lácteos',   cal: 87,  prot: 11.0, carbs: 1.4,  grasa: 4.0,  porcion: 100 },
  { nombre: 'Queso manchego (curado)',    categoria: 'Lácteos',   cal: 392, prot: 26.0, carbs: 0.5,  grasa: 32.0, porcion: 30  },
  { nombre: 'Queso mozzarella',           categoria: 'Lácteos',   cal: 280, prot: 28.0, carbs: 3.6,  grasa: 17.0, porcion: 50  },
  { nombre: 'Requesón / ricotta',         categoria: 'Lácteos',   cal: 174, prot: 11.0, carbs: 3.0,  grasa: 13.0, porcion: 100 },
  { nombre: 'Queso cottage',              categoria: 'Lácteos',   cal: 98,  prot: 11.0, carbs: 3.4,  grasa: 4.3,  porcion: 100 },

  // ── CEREALES Y FÉCULAS ───────────────────────────────────
  { nombre: 'Arroz blanco (cocido)',      categoria: 'Cereales',  cal: 130, prot: 2.7,  carbs: 28.0, grasa: 0.3,  porcion: 150 },
  { nombre: 'Arroz integral (cocido)',    categoria: 'Cereales',  cal: 122, prot: 2.7,  carbs: 26.0, grasa: 1.0,  porcion: 150 },
  { nombre: 'Pasta blanca (cocida)',      categoria: 'Cereales',  cal: 131, prot: 5.0,  carbs: 25.0, grasa: 1.1,  porcion: 150 },
  { nombre: 'Pasta integral (cocida)',    categoria: 'Cereales',  cal: 124, prot: 5.0,  carbs: 23.0, grasa: 1.4,  porcion: 150 },
  { nombre: 'Avena (cruda)',              categoria: 'Cereales',  cal: 379, prot: 13.0, carbs: 66.0, grasa: 7.0,  porcion: 50  },
  { nombre: 'Quinoa (cocida)',            categoria: 'Cereales',  cal: 120, prot: 4.4,  carbs: 22.0, grasa: 1.9,  porcion: 150 },
  { nombre: 'Pan blanco',                 categoria: 'Cereales',  cal: 265, prot: 9.0,  carbs: 53.0, grasa: 3.0,  porcion: 50  },
  { nombre: 'Pan integral',               categoria: 'Cereales',  cal: 247, prot: 12.0, carbs: 46.0, grasa: 4.0,  porcion: 50  },
  { nombre: 'Patata (cocida)',            categoria: 'Cereales',  cal: 87,  prot: 1.9,  carbs: 20.0, grasa: 0.1,  porcion: 150 },
  { nombre: 'Boniato (cocido)',           categoria: 'Cereales',  cal: 90,  prot: 2.0,  carbs: 21.0, grasa: 0.1,  porcion: 150 },
  { nombre: 'Copos de maíz (corn flakes)',categoria: 'Cereales',  cal: 376, prot: 7.0,  carbs: 84.0, grasa: 0.5,  porcion: 40  },
  { nombre: 'Tortita de arroz',           categoria: 'Cereales',  cal: 387, prot: 7.0,  carbs: 86.0, grasa: 2.5,  porcion: 10  },

  // ── LEGUMBRES ────────────────────────────────────────────
  { nombre: 'Lentejas (cocidas)',         categoria: 'Legumbres', cal: 116, prot: 9.0,  carbs: 20.0, grasa: 0.4,  porcion: 150 },
  { nombre: 'Garbanzos (cocidos)',        categoria: 'Legumbres', cal: 164, prot: 8.9,  carbs: 27.0, grasa: 2.6,  porcion: 150 },
  { nombre: 'Alubias negras (cocidas)',   categoria: 'Legumbres', cal: 132, prot: 8.9,  carbs: 24.0, grasa: 0.5,  porcion: 150 },
  { nombre: 'Edamame',                    categoria: 'Legumbres', cal: 122, prot: 11.0, carbs: 10.0, grasa: 5.0,  porcion: 100 },
  { nombre: 'Tofu',                       categoria: 'Legumbres', cal: 76,  prot: 8.0,  carbs: 1.9,  grasa: 4.2,  porcion: 100 },

  // ── FRUTAS ───────────────────────────────────────────────
  { nombre: 'Plátano',                    categoria: 'Frutas',    cal: 89,  prot: 1.1,  carbs: 23.0, grasa: 0.3,  porcion: 120 },
  { nombre: 'Manzana',                    categoria: 'Frutas',    cal: 52,  prot: 0.3,  carbs: 14.0, grasa: 0.2,  porcion: 150 },
  { nombre: 'Naranja',                    categoria: 'Frutas',    cal: 47,  prot: 0.9,  carbs: 12.0, grasa: 0.1,  porcion: 150 },
  { nombre: 'Fresa',                      categoria: 'Frutas',    cal: 33,  prot: 0.7,  carbs: 8.0,  grasa: 0.3,  porcion: 150 },
  { nombre: 'Arándanos',                  categoria: 'Frutas',    cal: 57,  prot: 0.7,  carbs: 14.0, grasa: 0.3,  porcion: 100 },
  { nombre: 'Mango',                      categoria: 'Frutas',    cal: 60,  prot: 0.8,  carbs: 15.0, grasa: 0.4,  porcion: 150 },
  { nombre: 'Sandía',                     categoria: 'Frutas',    cal: 30,  prot: 0.6,  carbs: 8.0,  grasa: 0.2,  porcion: 200 },
  { nombre: 'Uvas',                       categoria: 'Frutas',    cal: 69,  prot: 0.7,  carbs: 18.0, grasa: 0.2,  porcion: 100 },
  { nombre: 'Pera',                       categoria: 'Frutas',    cal: 57,  prot: 0.4,  carbs: 15.0, grasa: 0.1,  porcion: 150 },
  { nombre: 'Kiwi',                       categoria: 'Frutas',    cal: 61,  prot: 1.1,  carbs: 15.0, grasa: 0.5,  porcion: 100 },
  { nombre: 'Piña',                       categoria: 'Frutas',    cal: 50,  prot: 0.5,  carbs: 13.0, grasa: 0.1,  porcion: 150 },
  { nombre: 'Melocotón',                  categoria: 'Frutas',    cal: 39,  prot: 0.9,  carbs: 10.0, grasa: 0.3,  porcion: 150 },
  { nombre: 'Aguacate',                   categoria: 'Frutas',    cal: 160, prot: 2.0,  carbs: 9.0,  grasa: 15.0, porcion: 100 },

  // ── VERDURAS ─────────────────────────────────────────────
  { nombre: 'Brócoli',                    categoria: 'Verduras',  cal: 34,  prot: 2.8,  carbs: 7.0,  grasa: 0.4,  porcion: 100 },
  { nombre: 'Espinacas',                  categoria: 'Verduras',  cal: 23,  prot: 2.9,  carbs: 3.6,  grasa: 0.4,  porcion: 100 },
  { nombre: 'Lechuga / mix verde',        categoria: 'Verduras',  cal: 15,  prot: 1.4,  carbs: 2.9,  grasa: 0.2,  porcion: 100 },
  { nombre: 'Tomate',                     categoria: 'Verduras',  cal: 18,  prot: 0.9,  carbs: 3.9,  grasa: 0.2,  porcion: 150 },
  { nombre: 'Pepino',                     categoria: 'Verduras',  cal: 16,  prot: 0.7,  carbs: 3.6,  grasa: 0.1,  porcion: 100 },
  { nombre: 'Zanahoria',                  categoria: 'Verduras',  cal: 41,  prot: 0.9,  carbs: 10.0, grasa: 0.2,  porcion: 100 },
  { nombre: 'Pimiento rojo',              categoria: 'Verduras',  cal: 31,  prot: 1.0,  carbs: 6.0,  grasa: 0.3,  porcion: 100 },
  { nombre: 'Cebolla',                    categoria: 'Verduras',  cal: 40,  prot: 1.1,  carbs: 9.0,  grasa: 0.1,  porcion: 80  },
  { nombre: 'Calabacín',                  categoria: 'Verduras',  cal: 17,  prot: 1.2,  carbs: 3.1,  grasa: 0.3,  porcion: 100 },
  { nombre: 'Champiñón',                  categoria: 'Verduras',  cal: 22,  prot: 3.1,  carbs: 3.3,  grasa: 0.3,  porcion: 100 },
  { nombre: 'Coliflor',                   categoria: 'Verduras',  cal: 25,  prot: 1.9,  carbs: 5.0,  grasa: 0.3,  porcion: 100 },
  { nombre: 'Judías verdes',              categoria: 'Verduras',  cal: 31,  prot: 1.8,  carbs: 7.0,  grasa: 0.1,  porcion: 100 },
  { nombre: 'Berenjena',                  categoria: 'Verduras',  cal: 25,  prot: 1.0,  carbs: 6.0,  grasa: 0.2,  porcion: 100 },
  { nombre: 'Espárragos',                 categoria: 'Verduras',  cal: 20,  prot: 2.2,  carbs: 3.9,  grasa: 0.1,  porcion: 100 },

  // ── GRASAS Y ACEITES ─────────────────────────────────────
  { nombre: 'Aceite de oliva',            categoria: 'Grasas',    cal: 884, prot: 0.0,  carbs: 0.0,  grasa: 100.0, porcion: 10 },
  { nombre: 'Mantequilla',                categoria: 'Grasas',    cal: 717, prot: 0.9,  carbs: 0.1,  grasa: 81.0, porcion: 10  },
  { nombre: 'Mantequilla de cacahuete',   categoria: 'Grasas',    cal: 588, prot: 25.0, carbs: 20.0, grasa: 50.0, porcion: 30  },
  { nombre: 'Almendras',                  categoria: 'Grasas',    cal: 579, prot: 21.0, carbs: 22.0, grasa: 50.0, porcion: 30  },
  { nombre: 'Nueces',                     categoria: 'Grasas',    cal: 654, prot: 15.0, carbs: 14.0, grasa: 65.0, porcion: 30  },
  { nombre: 'Cacahuetes',                 categoria: 'Grasas',    cal: 567, prot: 26.0, carbs: 16.0, grasa: 49.0, porcion: 30  },

  // ── BEBIDAS ──────────────────────────────────────────────
  { nombre: 'Leche de avena',             categoria: 'Bebidas',   cal: 47,  prot: 1.0,  carbs: 9.0,  grasa: 1.0,  porcion: 250 },
  { nombre: 'Leche de almendra',          categoria: 'Bebidas',   cal: 15,  prot: 0.5,  carbs: 1.5,  grasa: 1.0,  porcion: 250 },
  { nombre: 'Zumo de naranja (natural)',  categoria: 'Bebidas',   cal: 45,  prot: 0.7,  carbs: 10.0, grasa: 0.2,  porcion: 250 },
  { nombre: 'Proteína de suero (whey)',   categoria: 'Bebidas',   cal: 380, prot: 75.0, carbs: 10.0, grasa: 5.0,  porcion: 30  },

  // ── OTROS ────────────────────────────────────────────────
  { nombre: 'Chocolate negro 85%',        categoria: 'Otros',     cal: 598, prot: 8.0,  carbs: 35.0, grasa: 52.0, porcion: 30  },
  { nombre: 'Miel',                       categoria: 'Otros',     cal: 304, prot: 0.3,  carbs: 82.0, grasa: 0.0,  porcion: 20  },
  { nombre: 'Galleta María',              categoria: 'Otros',     cal: 453, prot: 7.0,  carbs: 73.0, grasa: 16.0, porcion: 30  },
  { nombre: 'Mermelada',                  categoria: 'Otros',     cal: 278, prot: 0.4,  carbs: 69.0, grasa: 0.1,  porcion: 20  },
  { nombre: 'Aceitunas',                  categoria: 'Otros',     cal: 145, prot: 1.0,  carbs: 3.8,  grasa: 15.0, porcion: 30  },
  { nombre: 'Hummus',                     categoria: 'Otros',     cal: 166, prot: 8.0,  carbs: 14.0, grasa: 10.0, porcion: 50  },
];

export default ALIMENTOS;
