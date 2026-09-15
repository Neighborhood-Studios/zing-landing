/* Zing Onboarding v2 · Parte 5 · Productos (segunda tanda)
   Se concatena a window.PRODUCTS_TRACK.modules desde products.js. Mismo formato. */
window.PRODUCTS_MORE = [
{ id:"pd-tilex", icon:"🦠", img:"products/clorox-tilex-mold-mildew.webp", mins:3,
  t:"Clorox Plus Tilex (moho y hongos)",
  lead:"El especialista en moho negro de la ducha. Cloro fuerte: solo cuando Scrubbing Bubbles no alcanzó.",
  blocks:[
    {k:"h", text:"Para qué sirve"},
    {k:"p", text:"Moho y hongos en juntas de azulejo, esquinas de la ducha, silicona de la tina, cortinas de ducha de plástico y rejillas del baño. Mata el moho y blanquea la mancha."},
    {k:"h", text:"Dónde sí"},
    {k:"check", items:["Juntas y esquinas de cerámica en la ducha","Silicona (caulk) de tina y ducha","Cortina de ducha de plástico","Rejilla del extractor del baño","Fibra de vidrio y porcelana"]},
    {k:"rule", tone:"dont", title:"Nunca en", items:["Mármol, travertino ni piedra natural","Grifería dorada, latón ni acero cepillado","Telas, alfombras ni ropa: blanquea al instante","Madera ni superficies pintadas","Junto con Zep, Bar Keepers, Windex ni ningún ácido o amoníaco: gas tóxico"]},
    {k:"h", text:"Cómo se aplica"},
    {k:"check", items:["Extractor prendido o ventana abierta. Guantes","Rociar directo sobre el moho a 15–20 cm","Dejar actuar 5 minutos sin frotar","Enjuagar con abundante agua","Si queda mancha: repetir una vez, nunca dejar toda la visita","Secar"]},
    {k:"say", text:"Rociar, esperar 5 minutos, enjuagar. Sin frotar: el cloro hace el trabajo."},
    {k:"note", text:"Regla Zing: Tilex es el último recurso del baño, no el primero. Orden: Scrubbing Bubbles → si el moho sigue, Tilex. Nunca los dos sin enjuagar entre uno y otro. Si el moho está dentro de la silicona y no sale, se fotografía y se reporta: es mantenimiento del edificio."}
  ],
  quiz:[
    {q:"¿Cuánto dejas actuar Tilex sobre el moho?", opts:["Lo froto de inmediato","5 minutos sin frotar, luego enjuago","Toda la visita"], a:1,
     why:"El cloro necesita tiempo de contacto. Frotar no ayuda; dejarlo horas daña la superficie."},
    {q:"El moho está dentro de la silicona de la tina y no sale con Tilex. ¿Qué haces?", opts:["Lo raspo con algo metálico","Aplico Zep encima","Fotografío y reporto: es mantenimiento del edificio"], a:2,
     why:"El moho dentro de la silicona requiere cambiarla. Y Zep con cloro produce gas tóxico."},
    {q:"¿Cuándo se usa Tilex?", opts:["En cada limpieza de baño","Solo cuando Scrubbing Bubbles no quitó el moho","En la cocina"], a:1,
     why:"Es el último recurso del baño. Scrubbing Bubbles primero."}
  ]},

{ id:"pd-toiletwand", icon:"🚽", img:"products/clorox-toiletwand.webp", mins:3,
  t:"Clorox ToiletWand (varita con esponja desechable)",
  lead:"El único cepillo que entra en un inodoro. La esponja lleva el limpiador, se usa una vez y se tira.",
  blocks:[
    {k:"h", text:"Para qué sirve"},
    {k:"p", text:"Limpiar y desinfectar el interior del inodoro sin cepillo permanente ni contacto con la mano. Cada esponja tiene el producto integrado y se desecha después de un inodoro."},
    {k:"h", text:"Dónde sí"},
    {k:"check", items:["Interior de la taza: paredes, bajo el borde, el fondo","Un inodoro por esponja"]},
    {k:"rule", tone:"dont", title:"Nunca", items:["Usar la misma esponja en dos inodoros ni en dos apartamentos","Usar la esponja fuera de la taza: asiento, tapa, tanque, piso","Tirar la esponja al inodoro: tapa la tubería","Dejar la varita mojada en el carrito sin secar"]},
    {k:"h", text:"Cómo se aplica"},
    {k:"check", items:["Guantes puestos","Encajar una esponja nueva en la varita (clic)","Sumergir en el agua de la taza 1–2 segundos para activar el producto","Frotar paredes, bajo el borde y el fondo, en círculos","Dejar actuar 1 minuto si hay manchas","Presionar el botón y soltar la esponja en la bolsa de basura del carrito","Jalar la cadena. Secar la varita y guardarla en su base"]},
    {k:"say", text:"Una esponja, un inodoro, a la basura. Nunca al inodoro."},
    {k:"note", text:"Regla Zing: el exterior del inodoro (asiento, tapa, tanque, base) se limpia con Clorox Clean-Up y paño rojo. La varita solo toca el agua. Si un residente tiene su propio cepillo, no se usa: el nuestro es desechable por higiene."}
  ],
  quiz:[
    {q:"Terminaste el inodoro. ¿Dónde va la esponja usada?", opts:["Al inodoro y jalo la cadena","A la bolsa de basura del carrito","La guardo para el siguiente baño"], a:1,
     why:"Al inodoro tapa la tubería. Reusarla traslada gérmenes. Una esponja por inodoro, a la basura."},
    {q:"¿Puedes limpiar el asiento con la esponja de la varita?", opts:["Sí, es el mismo inodoro","No: la esponja solo toca el interior de la taza. El asiento va con Clorox y paño rojo","Sí, si está nueva"], a:1,
     why:"La esponja va dentro de la taza. El exterior se limpia con paño rojo y Clorox."},
    {q:"El residente tiene su propio cepillo junto al inodoro. ¿Cuál usas?", opts:["El del residente, para ahorrar esponjas","La varita Zing con esponja nueva","Ninguno"], a:1,
     why:"Siempre nuestra varita desechable. Es la garantía de higiene entre apartamentos."}
  ]},

{ id:"pd-weiman-ss", icon:"🧊", img:"products/weiman-stainless-steel.webp", mins:3,
  t:"Weiman Stainless Steel (acero inoxidable)",
  lead:"Para el frente de refrigerador, lavavajillas, horno y microondas. Quita huellas y deja una capa que las repele.",
  blocks:[
    {k:"h", text:"Para qué sirve"},
    {k:"p", text:"Limpiar, dar brillo y proteger electrodomésticos de acero inoxidable: refrigerador, lavavajillas, frente del horno, microondas, campana, tostadora. Quita huellas, grasa ligera y manchas de agua sin rayar."},
    {k:"h", text:"Dónde sí"},
    {k:"check", items:["Frentes de electrodomésticos de acero inoxidable","Campana extractora","Grifería de acero inoxidable (no dorada)","Fregadero de acero, como brillo final"]},
    {k:"rule", tone:"dont", title:"Nunca en", items:["Acero inoxidable con acabado negro o mate (black stainless): probar en una esquina; suele ser una película que se daña","Pantallas ni paneles de control con vidrio: rociar el paño","Piedra, madera, plástico brillante","Interior del horno o del refrigerador"]},
    {k:"h", text:"Cómo se aplica"},
    {k:"check", items:["Quitar migas y polvo con paño seco","Rociar poco, directo sobre el acero (o sobre el paño si hay controles cerca)","Pasar paño de microfibra azul en la dirección de la veta, de arriba hacia abajo","Terminar con el lado seco del paño, también con la veta","Sin enjuagar"]},
    {k:"say", text:"Siempre con la veta. En contra deja rayas que se ven con la luz."},
    {k:"note", text:"Regla Zing: este es el producto de los electrodomésticos. Ni Bar Keepers Friend, ni Ajax, ni Windex en el frente del refrigerador. Si tienes Weiman Stainless a la mano, va antes que Pledge."}
  ],
  quiz:[
    {q:"¿En qué dirección se pasa el paño en el refrigerador?", opts:["En círculos","En la dirección de la veta del acero","Da igual"], a:1,
     why:"Contra la veta quedan rayas visibles. Siempre con la veta, de arriba hacia abajo."},
    {q:"El refrigerador es de acero negro mate. ¿Qué haces?", opts:["Weiman en todo el frente","Pruebo en una esquina escondida primero","Uso Bar Keepers Friend"], a:1,
     why:"El acero negro suele tener una película que puede dañarse. Prueba primero."},
    {q:"El frente del horno tiene una mancha de grasa seca. ¿Qué usas?", opts:["Bar Keepers Friend","Weiman Stainless con paño, y si no sale, Dawn con agua tibia","Easy-Off"], a:1,
     why:"Nada abrasivo en electrodomésticos. Weiman o Dawn."}
  ]},

{ id:"pd-weiman-cooktop", icon:"♨️", img:"products/weiman-cook-top.webp", mins:3,
  t:"Weiman Cook Top (estufa de vidrio)",
  lead:"Para estufas de vitrocerámica e inducción. Crema suave que quita lo quemado sin rayar el vidrio.",
  blocks:[
    {k:"h", text:"Para qué sirve"},
    {k:"p", text:"Limpieza diaria y manchas quemadas en estufas de vidrio-cerámica y de inducción. Disuelve grasa y residuos de comida y deja una capa que facilita la siguiente limpieza."},
    {k:"h", text:"Dónde sí"},
    {k:"check", items:["Estufas de vitrocerámica (vidrio negro liso)","Estufas de inducción","Vidrio de la puerta del horno por fuera"]},
    {k:"rule", tone:"dont", title:"Nunca en", items:["Estufas de gas con parrillas: ahí va Zep Citrus Degreaser","Estufas de resistencias eléctricas a la vista","Estufa caliente: esperar a que esté fría","Con esponja de acero, Ajax ni Bar Keepers en polvo: raya el vidrio","Piedra, madera, acero inoxidable"]},
    {k:"h", text:"Cómo se aplica"},
    {k:"check", items:["Estufa completamente fría","Retirar migas con paño seco","Rociar sobre el vidrio","Frotar con paño de microfibra verde o la esponja no abrasiva","Residuos quemados: dejar actuar 2 minutos y usar el raspador plástico en ángulo bajo","Pasar paño húmedo y luego seco hasta que brille"]},
    {k:"say", text:"Fría, crema, paño, raspador plástico si hace falta. Nunca metal."},
    {k:"note", text:"Regla Zing: si la estufa tiene una raya o un golpe al llegar, se fotografía antes de empezar. El vidrio de estufa es caro y una raya siempre se nota."}
  ],
  quiz:[
    {q:"Hay comida quemada y pegada en el vidrio de la estufa. ¿Qué usas para despegarla?", opts:["Esponja de acero","Raspador plástico en ángulo bajo, después de dejar actuar el producto","Cuchillo"], a:1,
     why:"Cualquier metal raya el vidrio. Producto, tiempo y raspador plástico."},
    {q:"La estufa es de gas con parrillas de hierro. ¿Usas Weiman Cook Top?", opts:["Sí, es una estufa","No: es para vidrio. Las estufas de gas van con Zep Citrus Degreaser","Sí, en las parrillas"], a:1,
     why:"Cook Top es para vitrocerámica e inducción. Gas y parrillas: desengrasante."},
    {q:"¿Qué haces antes de aplicar el producto?", opts:["Calentar la estufa para que actúe mejor","Confirmar que está fría y quitar migas en seco","Mojar toda la estufa"], a:1,
     why:"Fría siempre, y sin migas para no arrastrarlas sobre el vidrio."}
  ]},

{ id:"pd-magic", icon:"🧽", img:"products/mr-clean-magic-eraser.webp", mins:3,
  t:"Mr. Clean Magic Eraser (esponja mágica)",
  lead:"Quita marcas que nada más quita: rayones de zapatos, crayón, manchas en paredes. Es una lija muy fina: brillante donde no debe, opaca.",
  blocks:[
    {k:"h", text:"Para qué sirve"},
    {k:"p", text:"Marcas en paredes pintadas mate, zócalos, marcos de puerta, interruptores, suciedad pegada en plástico, manchas en la tina de porcelana, residuo en la puerta de la ducha. Solo con agua."},
    {k:"h", text:"Dónde sí"},
    {k:"check", items:["Paredes con pintura mate o satinada (probar en una esquina)","Zócalos y marcos de puerta blancos","Interruptores y placas de plástico","Tina y lavamanos de porcelana","Suelas de zapatos, marcas de ruedas en el piso de cerámica"]},
    {k:"rule", tone:"dont", title:"Nunca en", items:["Pintura brillante o semibrillante: deja un parche opaco","Acero inoxidable: raya","Estufa de vidrio, pantallas, espejos","Madera barnizada, laminado brillante, muebles","Antiadherente, plástico brillante, carros","Piedra natural pulida","Piel: es abrasiva, guantes siempre"]},
    {k:"h", text:"Cómo se aplica"},
    {k:"check", items:["Mojar la esponja y escurrirla hasta que no gotee","Frotar suave, sin presión, en la mancha y nada más","Revisar a mitad: si el brillo de la superficie cambia, parar","Pasar paño húmedo para retirar el residuo","Secar","Tirar la esponja cuando se deshaga; nunca con producto químico encima"]},
    {k:"say", text:"Solo agua, poca presión, solo la mancha. Si duda, no."},
    {k:"note", text:"Regla Zing: la esponja mágica es para marcas puntuales, no para limpiar superficies grandes. Una pared pintada frotada por completo queda con manchas de brillo que el residente ve al día siguiente."}
  ],
  quiz:[
    {q:"Hay una marca de zapato en la pared blanca mate. ¿Cómo la quitas?", opts:["Clorox Clean-Up","Esponja mágica húmeda, suave, solo en la marca","Ajax"], a:1,
     why:"Es exactamente para eso. Agua, poca presión y solo la mancha."},
    {q:"La puerta del baño tiene pintura brillante con una mancha. ¿Usas la esponja mágica?", opts:["Sí, quita todo","No: en pintura brillante deja un parche opaco. Dawn con agua","Sí, con Clorox"], a:1,
     why:"La esponja es una lija fina. En brillo deja marca opaca permanente."},
    {q:"¿Con qué producto se usa la esponja mágica?", opts:["Con Clorox para desinfectar","Solo con agua","Con Windex"], a:1,
     why:"Solo agua. Con químicos se deshace y puede reaccionar."}
  ]},

{ id:"pd-soappads", icon:"🍳", img:"products/steel-wool-soap-pads.webp", mins:3,
  t:"Soap pads (lana de acero con jabón)",
  lead:"Para ollas, sartenes de acero y parrillas de la estufa con comida quemada. Rayan todo lo demás.",
  blocks:[
    {k:"h", text:"Para qué sirve"},
    {k:"p", text:"Comida quemada y grasa pegada en ollas y sartenes de acero inoxidable, parrillas de hierro de la estufa de gas, bandejas del horno, rejillas de la parrilla."},
    {k:"h", text:"Dónde sí"},
    {k:"check", items:["Ollas y sartenes de acero inoxidable (sin antiadherente)","Parrillas de hierro de estufa de gas","Bandejas y rejillas del horno","Charolas de metal"]},
    {k:"rule", tone:"dont", title:"Nunca en", items:["Sartenes antiadherentes (teflón) ni cerámicas","Fregadero de acero inoxidable: raya","Frente de electrodomésticos","Vidrio, estufa de vitrocerámica, espejos","Porcelana, tina, lavamanos","Piedra, madera, plástico","Cobre, aluminio pulido, ollas con colores"]},
    {k:"h", text:"Cómo se aplica"},
    {k:"check", items:["Mojar el pad con agua caliente para activar el jabón","Frotar en círculos solo en la zona quemada","Enjuagar bien la olla o parrilla","Secar de inmediato: el hierro y el acero se oxidan mojados","Tirar el pad después de usarlo: mojado se oxida en un día y mancha el carrito"]},
    {k:"say", text:"Solo ollas y parrillas. Un pad, un uso, a la basura."},
    {k:"note", text:"Regla Zing: si no estás segura de si una olla es antiadherente, mira el interior: si es negro o gris liso y no brilla como metal, no se toca con lana de acero. Se remoja con Dawn."}
  ],
  quiz:[
    {q:"El fregadero de acero inoxidable tiene una mancha. ¿Usas el soap pad?", opts:["Sí, es acero","No: raya el fregadero. Bar Keepers Friend con paño húmedo","Sí, con poca fuerza"], a:1,
     why:"La lana de acero raya superficies grandes. En fregadero, Bar Keepers Friend."},
    {q:"Una sartén tiene el interior negro liso con comida pegada. ¿Qué haces?", opts:["Soap pad","La remojo con Dawn y agua caliente: es antiadherente","Ajax"], a:1,
     why:"Interior negro liso sin brillo de metal es antiadherente. Nunca lana de acero."},
    {q:"Terminaste con el soap pad. ¿Qué haces con él?", opts:["Lo guardo mojado en el carrito","Lo tiro: mojado se oxida y mancha","Lo dejo en el fregadero del residente"], a:1,
     why:"Un pad usado se oxida en un día y deja manchas de óxido donde lo dejes."}
  ]},

{ id:"pd-scourer", icon:"🌀", img:"products/stainless-scourers.webp", mins:2,
  t:"Esponja de acero inoxidable (scourer)",
  lead:"Espiral de metal para lo más pegado en ollas y parrillas. No lleva jabón, no se oxida, pero raya igual que el soap pad.",
  blocks:[
    {k:"h", text:"Para qué sirve"},
    {k:"p", text:"Restos muy pegados en ollas y sartenes de acero, parrillas de hierro, rejillas del horno y de la parrilla. A diferencia del soap pad, se enjuaga y se reutiliza."},
    {k:"h", text:"Dónde sí"},
    {k:"check", items:["Ollas y sartenes de acero inoxidable","Parrillas de hierro fundido de la estufa","Rejillas y bandejas del horno"]},
    {k:"rule", tone:"dont", title:"Nunca en", items:["Antiadherente, cerámica, esmalte","Fregadero, frente de electrodomésticos, grifería","Vidrio, vitrocerámica, porcelana","Piedra, madera, plástico","Nada que no sea metal grueso de cocina"]},
    {k:"h", text:"Cómo se aplica"},
    {k:"check", items:["Con unas gotas de Dawn y agua caliente","Frotar solo la zona pegada","Enjuagar la olla y la esponja","Escurrir la esponja y dejarla secar; se reutiliza","Cambiarla cuando se aplane o suelte hilos de metal"]},
    {k:"say", text:"Mismas reglas que el soap pad: solo metal grueso de cocina."},
    {k:"note", text:"Regla Zing: la esponja de acero vive en la bolsa de cocina del carrito, nunca junto a los paños. Un hilo de metal suelto dentro de un paño raya la siguiente superficie que toques."}
  ],
  quiz:[
    {q:"¿En qué se diferencia del soap pad?", opts:["Sirve en más superficies","No lleva jabón, no se oxida y se reutiliza","Es más suave"], a:1,
     why:"Misma agresividad, pero reutilizable. Las superficies permitidas son las mismas."},
    {q:"¿Dónde se guarda la esponja de acero?", opts:["Con los paños de microfibra","En la bolsa de cocina, separada de los paños","En el bolsillo"], a:1,
     why:"Un hilo de metal en un paño raya lo siguiente que limpies."},
    {q:"La rejilla del horno tiene grasa carbonizada. ¿Qué usas?", opts:["Esponja de acero con Dawn y agua caliente","Esponja mágica","Paño verde"], a:0,
     why:"Rejillas del horno son metal grueso: es justo el uso de la esponja de acero."}
  ]},

{ id:"pd-murphy", icon:"🪑", img:"products/murphy-oil-soap.webp", mins:3,
  t:"Murphy Oil Soap (jabón para madera)",
  lead:"Para muebles y gabinetes de madera con grasa o suciedad pegada. Concentrado: siempre diluido, nunca en pisos de madera.",
  blocks:[
    {k:"h", text:"Para qué sirve"},
    {k:"p", text:"Limpiar madera barnizada o sellada con suciedad acumulada: puertas de gabinetes de cocina con grasa, mesas, sillas, puertas, marcos, barandas. Limpia sin dejar cera ni brillo artificial."},
    {k:"h", text:"Dónde sí"},
    {k:"check", items:["Gabinetes de cocina de madera (puertas y marcos)","Mesas, sillas, cabeceras de madera","Puertas y marcos de madera","Barandas y pasamanos"]},
    {k:"rule", tone:"dont", title:"Nunca en", items:["Pisos de madera: ahí va Bona. Murphy deja película y los deja resbalosos","Madera sin sellar, encerada o aceitada","Laminado que imita madera: no daña, pero no sirve; Pledge","Piedra, vidrio, acero","Sin diluir sobre la madera","Dejar la madera mojada"]},
    {k:"h", text:"Cómo se aplica"},
    {k:"check", items:["Diluir: ¼ de taza (60 ml) en 4 litros de agua tibia. Suciedad pesada: ½ taza","Marcar la botella o el balde","Paño de microfibra azul húmedo y muy escurrido","Pasar en la dirección de la veta","Secar de inmediato con paño seco","Sin enjuagar si está bien diluido"]},
    {k:"say", text:"Muebles y gabinetes sí. Pisos de madera nunca: Bona."},
    {k:"note", text:"Regla Zing: los gabinetes junto a la estufa se limpian con Murphy diluido en cada limpieza profunda de cocina. Si la grasa está muy pegada, Zep Citrus muy diluido primero, enjuague, y Murphy para terminar."}
  ],
  quiz:[
    {q:"El piso de madera de la sala se ve opaco. ¿Usas Murphy Oil Soap?", opts:["Sí, es para madera","No: en pisos deja película y los hace resbalosos. Bona","Sí, diluido"], a:1,
     why:"Murphy es para muebles y gabinetes. En pisos de madera, siempre Bona."},
    {q:"¿Cuánto Murphy va en 4 litros de agua para gabinetes?", opts:["Media botella","¼ de taza (60 ml)","Sin diluir"], a:1,
     why:"Concentrado. Más producto deja película pegajosa en la madera."},
    {q:"Después de pasar el paño con Murphy, ¿qué falta?", opts:["Nada, seca solo","Secar de inmediato con paño seco","Enjuagar con mucha agua"], a:1,
     why:"La madera nunca se deja mojada. Paño seco de inmediato."}
  ]}
];
