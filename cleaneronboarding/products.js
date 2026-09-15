/* Zing Onboarding v2 · Parte 5 · Productos
   Un módulo por producto del carrito: para qué sirve, dónde sí, dónde no, cómo se aplica.
   Mismo formato que tracks.js. Se inserta antes de "grow" en tracks.js (que pasa a Parte 6).
   Los módulos con core:true forman "Productos esenciales" dentro del onboarding inicial (cuentan para el certificado)
   y no se repiten en Parte 5. Instrucciones basadas en la etiqueta de cada fabricante; las reglas Zing van en bloques "note". */
window.PRODUCTS_TRACK = { key: "products", icon: "🧴", label: "Parte 5 · Productos", blurb: "Qué es cada botella del carrito, dónde va, dónde no, y cómo se aplica.",
  modules: [
{ id:"pd-regla", icon:"⚠️", core:true, mins:3,
  t:"Antes de tocar cualquier botella",
  lead:"Cuatro reglas que aplican a todos los productos de esta parte. Si dudas de una superficie, para y pregunta.",
  blocks:[
    {k:"say", text:"LEE LA ETIQUETA. PRUEBA EN UNA ESQUINA. NUNCA MEZCLES."},
    {k:"h", text:"Las cuatro reglas"},
    {k:"check", items:[
      "Nunca mezcles productos. Cloro + amoníaco o cloro + ácido produce gas tóxico",
      "Prueba en un lugar escondido antes de usar un producto en una superficie nueva",
      "Ventila: abre una ventana o prende el extractor con productos fuertes",
      "Guantes siempre. Nunca comas ni bebas mientras usas producto"
    ]},
    {k:"h", text:"Tres tipos de producto"},
    {k:"p", text:"Con cloro (Clorox Clean-Up, Scrubbing Bubbles, Ajax): desinfectan y blanquean, pero dañan piedra natural, madera y telas. Ácidos (Zep Shower Tub & Tile, Zep Grout, Bar Keepers Friend): quitan sarro y óxido, pero comen mármol, granito y metales delicados. Neutros (Windex, Bona, Weiman, Pledge, Mr. Clean, Dawn): seguros para casi todo cuando se usan como dice la etiqueta."},
    {k:"rule", tone:"dont", title:"Nunca en piedra natural (mármol, granito, travertino, cuarcita)", items:["Clorox Clean-Up ni ningún producto con cloro","Zep Shower Tub & Tile, Zep Grout, Bar Keepers Friend ni ningún ácido","Vinagre ni limón"]},
    {k:"note", text:"Si no sabes de qué material es una encimera, un piso o un lavamanos, usa solo Weiman (encimera) o agua con Dawn (todo lo demás) y pregunta a Zing."}
  ],
  quiz:[
    {q:"Quieres reforzar el limpiador de baño mezclándolo con Clorox. ¿Está bien?", opts:["Sí, limpia más fuerte","No: nunca se mezclan productos, puede producir gas tóxico","Solo en poca cantidad"], a:1,
     why:"Cloro con amoníaco o con ácido produce gas tóxico. Nunca se mezcla."},
    {q:"Una encimera parece de piedra y no sabes cuál. ¿Qué usas?", opts:["Clorox Clean-Up, desinfecta todo","Bar Keepers Friend, es suave","Weiman para encimeras, y pregunto a Zing"], a:2,
     why:"Cloro y ácidos dañan la piedra natural. Ante la duda, el producto neutro y una pregunta."},
    {q:"¿Qué haces antes de usar un producto por primera vez en una superficie?", opts:["Aplicarlo en toda la superficie","Probar en una esquina escondida","Diluirlo a la mitad"], a:1,
     why:"La prueba en un lugar escondido evita manchas que no se pueden deshacer."}
  ]},

{ id:"pd-clorox", icon:"🧪", core:true, img:"products/clorox-clean-up-bleach.webp", mins:4,
  t:"Clorox Clean-Up con cloro",
  lead:"El desinfectante fuerte del carrito. Mata gérmenes y quita moho, pero es el producto que más superficies puede arruinar.",
  blocks:[
    {k:"h", text:"Para qué sirve"},
    {k:"p", text:"Desinfectar y quitar manchas, grasa y moho en superficies duras no porosas: inodoros por fuera, lavamanos de porcelana, azulejo de cerámica, encimeras de laminado o cuarzo sellado, botes de basura, tablas de cortar de plástico."},
    {k:"h", text:"Dónde sí"},
    {k:"check", items:["Porcelana y cerámica: inodoro, lavamanos, azulejo","Encimeras de laminado, cuarzo y acero inoxidable (enjuagar bien)","Plástico duro, vinilo, fibra de vidrio","Zonas con moho en juntas de cerámica"]},
    {k:"rule", tone:"dont", title:"Nunca en", items:["Mármol, granito ni ninguna piedra natural","Madera, pisos de madera ni muebles","Telas, alfombras ni cortinas: blanquea al instante","Aluminio, cobre, latón ni plata","Superficies con pintura o barniz","Cerca de ropa: una gota deja una mancha blanca permanente"]},
    {k:"h", text:"Cómo se aplica"},
    {k:"check", items:["Rociar directo a 15–20 cm hasta mojar la superficie","Para limpiar: pasar paño de inmediato","Para desinfectar: dejar actuar 30 segundos a 2 minutos sin secar","Enjuagar con agua las superficies donde se prepara comida","Secar con paño limpio del color de la zona"]},
    {k:"say", text:"Sin diluir. Nunca con otro producto. Ventana abierta."},
    {k:"note", text:"Regla Zing: no cargues Clorox en la mano mientras caminas por el apartamento. Va del carrito al baño o la cocina y regresa. Una gota en un sofá o una alfombra es un daño que se reporta."}
  ],
  quiz:[
    {q:"Hay moho en la junta del azulejo de la ducha. ¿Cuánto dejas actuar el Clorox?", opts:["Lo seco de inmediato","30 segundos a 2 minutos, sin secar","Toda la visita"], a:1,
     why:"Para desinfectar y quitar moho el producto necesita tiempo de contacto. Para limpiar rápido, se seca enseguida."},
    {q:"La encimera de la cocina es de granito. ¿Puedes desinfectarla con Clorox Clean-Up?", opts:["Sí, es cocina","No: el cloro daña la piedra natural. Uso Weiman","Sí, si enjuago rápido"], a:1,
     why:"Nunca cloro en piedra natural. Weiman es el producto para esas encimeras."},
    {q:"Se te cayó una gota de Clorox en la alfombra. ¿Qué haces?", opts:["Lo dejo, es una gota","Absorbo con agua de inmediato y reporto el daño a Zing","La froto con el paño"], a:1,
     why:"El cloro blanquea telas al instante. Se atiende y se reporta, nunca se esconde."}
  ]},

{ id:"pd-scrubbing", icon:"🫧", core:true, img:"products/scrubbing-bubbles-foaming-bleach.webp", mins:3,
  t:"Scrubbing Bubbles espuma con cloro (baño y ducha)",
  lead:"Espuma que se pega a las paredes de la ducha y disuelve jabón, sarro ligero y moho. Es el producto principal del baño.",
  blocks:[
    {k:"h", text:"Para qué sirve"},
    {k:"p", text:"Residuo de jabón, manchas de agua, moho y hongos en la ducha, la tina, el lavamanos y el azulejo del baño. La espuma se queda en superficies verticales, por eso funciona en paredes."},
    {k:"h", text:"Dónde sí"},
    {k:"check", items:["Paredes de ducha de cerámica, porcelana o fibra de vidrio","Tina y lavamanos de porcelana","Puertas de ducha de vidrio","Cortina de ducha de plástico","Inodoro por fuera"]},
    {k:"rule", tone:"dont", title:"Nunca en", items:["Ducha o piso de mármol, travertino o piedra natural","Grifería de latón, bronce o dorada","Madera ni telas","Encimeras de la cocina"]},
    {k:"h", text:"Cómo se aplica"},
    {k:"check", items:["Girar la boquilla a ON y rociar a 15–20 cm hasta cubrir","Dejar que la espuma actúe: 2 a 3 minutos (más si hay moho)","Frotar con esponja o paño amarillo húmedo","Enjuagar bien con agua","Secar el vidrio y la grifería para que no quede marca"]},
    {k:"say", text:"Rocía toda la ducha primero, deja actuar, y mientras tanto limpia el lavamanos. Así el tiempo de espera trabaja para ti."},
    {k:"note", text:"Regla Zing: en baños de piedra natural este producto no se usa. Se limpia con agua caliente y Dawn, y se avisa a Zing para revisar si el edificio necesita otro producto."}
  ],
  quiz:[
    {q:"¿Cuánto dejas actuar la espuma antes de frotar?", opts:["Se frota de inmediato","2 a 3 minutos, más si hay moho","20 minutos"], a:1,
     why:"La espuma necesita tiempo para disolver el jabón y el moho. Mientras espera, avanzas con otra tarea."},
    {q:"La ducha tiene paredes de travertino. ¿Usas Scrubbing Bubbles?", opts:["Sí, es para duchas","No: piedra natural. Agua caliente con Dawn y aviso a Zing","Sí, pero sin dejar actuar"], a:1,
     why:"El cloro y los ácidos manchan la piedra natural. Ante piedra, producto neutro y aviso."},
    {q:"Terminaste de enjuagar la puerta de vidrio. ¿Qué falta?", opts:["Nada","Secarla para que no queden marcas de agua","Rociar otra vez"], a:1,
     why:"El vidrio y la grifería se secan siempre. Las gotas dejan marcas blancas."}
  ]},

{ id:"pd-zeptile", icon:"🚿", img:"products/zep-shower-tub-tile.webp", mins:3,
  t:"Zep Shower, Tub & Tile",
  lead:"El ácido del baño: quita sarro duro y manchas de agua que la espuma no saca. Se usa poco y con cuidado.",
  blocks:[
    {k:"h", text:"Para qué sirve"},
    {k:"p", text:"Depósitos de cal y sarro, manchas blancas de agua dura, residuo de jabón pegado y óxido ligero en ducha, tina y azulejo de cerámica. Es más fuerte que Scrubbing Bubbles; se reserva para lo que la espuma no logró."},
    {k:"h", text:"Dónde sí"},
    {k:"check", items:["Azulejo de cerámica y porcelana","Tina y ducha de fibra de vidrio","Puertas de vidrio con capa de sarro","Juntas de cerámica"]},
    {k:"rule", tone:"dont", title:"Nunca en", items:["Mármol, travertino, granito ni piedra natural: la come","Grifería de latón, bronce, cobre ni acabados dorados o cepillados","Acero inoxidable sin enjuagar de inmediato","Madera, telas, alfombras","Mezclado con cloro: produce gas tóxico"]},
    {k:"h", text:"Cómo se aplica"},
    {k:"check", items:["Prender el extractor o abrir la ventana","Rociar directo sobre la superficie mojada","Dejar actuar 1 a 3 minutos. Nunca dejar que se seque","Frotar con esponja o cepillo","Enjuagar con abundante agua","Secar"]},
    {k:"say", text:"Primero Scrubbing Bubbles. Solo si el sarro sigue ahí, Zep."},
    {k:"note", text:"Regla Zing: si usaste Scrubbing Bubbles en la ducha, enjuaga por completo antes de usar Zep. Los dos productos nunca se encuentran en la misma superficie."}
  ],
  quiz:[
    {q:"La espuma no quitó las manchas blancas de la puerta de la ducha. ¿Qué usas?", opts:["Clorox Clean-Up","Zep Shower Tub & Tile, después de enjuagar toda la espuma","Más Scrubbing Bubbles, dejándolo 20 minutos"], a:1,
     why:"Zep es el ácido para sarro duro. Antes se enjuaga bien la espuma con cloro."},
    {q:"La grifería de la ducha es dorada. ¿Rocías Zep sobre ella?", opts:["Sí, quita el sarro","No: los acabados dorados, latón y bronce se dañan","Sí, si enjuago rápido"], a:1,
     why:"Los ácidos manchan metales delicados. Se limpian con agua y Dawn y se secan."},
    {q:"Rociaste Zep y te llaman al teléfono. ¿Qué pasa si se seca?", opts:["Nada, actúa más","Puede marcar la superficie: nunca se deja secar","Se evapora sin problema"], a:1,
     why:"Un ácido que se seca deja marca. Se aplica, se frota y se enjuaga sin pausas."}
  ]},

{ id:"pd-zepgrout", icon:"🧱", img:"products/zep-grout-cleaner.webp", mins:3,
  t:"Zep Grout Cleaner & Brightener",
  lead:"Para las líneas de junta oscuras entre azulejos. Ácido, como el anterior, pero pensado para el piso.",
  blocks:[
    {k:"h", text:"Para qué sirve"},
    {k:"p", text:"Aclarar juntas de cerámica y porcelana en pisos y paredes de baño y cocina: quita la mugre y el gris acumulado en la junta."},
    {k:"h", text:"Dónde sí"},
    {k:"check", items:["Juntas entre azulejos de cerámica o porcelana","Piso de baño y cocina de cerámica","Backsplash de cerámica"]},
    {k:"rule", tone:"dont", title:"Nunca en", items:["Juntas junto a mármol, travertino ni piedra natural","Juntas de color: puede aclararlas de forma desigual (probar en una esquina)","Metal, madera ni telas","Mezclado con cloro"]},
    {k:"h", text:"Cómo se aplica"},
    {k:"check", items:["Barrer o aspirar el piso primero","Aplicar directo sobre la junta","Dejar actuar 1 a 3 minutos, sin que se seque","Frotar con cepillo de juntas","Enjuagar con trapeador y agua limpia","Secar el piso"]},
    {k:"say", text:"Es un producto de limpieza profunda, no de cada visita. Se usa cuando la junta se ve oscura."},
    {k:"note", text:"Regla Zing: pisos con juntas negras en una primera visita se fotografían antes y después. Es lo que mejor muestra el cambio al residente."}
  ],
  quiz:[
    {q:"¿Cuándo se usa Zep Grout?", opts:["En cada visita, en todos los pisos","Cuando la junta se ve oscura: es limpieza profunda","Solo en la cocina"], a:1,
     why:"Es un producto de limpieza profunda para juntas grises o negras, no de rutina."},
    {q:"El piso es de azulejo con juntas de color beige. ¿Qué haces primero?", opts:["Aplico en todo el piso","Pruebo en una esquina escondida","Lo mezclo con agua"], a:1,
     why:"Las juntas de color pueden aclararse de forma desigual. Siempre se prueba."},
    {q:"¿Qué haces antes de aplicar el producto en el piso?", opts:["Mojar el piso con cloro","Barrer o aspirar","Nada"], a:1,
     why:"El polvo y el pelo se convierten en lodo si se aplica producto encima."}
  ]},

{ id:"pd-bkf", icon:"✨", core:true, img:"products/bar-keepers-friend-soft.webp", mins:4,
  t:"Bar Keepers Friend (crema suave)",
  lead:"La crema que quita óxido, manchas de agua y marcas de ollas. Ácida y con abrasivo suave: brilla, pero puede rayar.",
  blocks:[
    {k:"h", text:"Para qué sirve"},
    {k:"p", text:"Manchas difíciles en acero inoxidable (fregadero, ollas), porcelana (lavamanos, tina), cerámica, vidrio de estufa y marcas de metal en platos blancos. Quita óxido, sarro y manchas de agua dura."},
    {k:"h", text:"Dónde sí"},
    {k:"check", items:["Fregadero de acero inoxidable","Lavamanos, tina e inodoro de porcelana","Estufa de vidrio-cerámica (con cuidado y poco producto)","Ollas y sartenes de acero inoxidable","Azulejo de cerámica"]},
    {k:"rule", tone:"dont", title:"Nunca en", items:["Mármol, granito ni piedra natural","Acero inoxidable de electrodomésticos con acabado cepillado (refrigerador, lavavajillas): raya. Ahí va Pledge","Grifería dorada, latón, cobre ni cromo delicado","Antiadherente (teflón), plástico, laca, pintura","Superficies de espejo o brillantes","Vidrio de ventanas"]},
    {k:"h", text:"Cómo se aplica"},
    {k:"check", items:["Mojar la superficie","Aplicar una cantidad pequeña sobre paño o esponja húmeda, no directo","Frotar suave, en la dirección de la veta si es acero","Dejar actuar máximo 1 minuto","Enjuagar bien con agua","Secar por completo: si queda producto, deja marca blanca"]},
    {k:"say", text:"Poco producto, siempre húmedo, enjuague completo."},
    {k:"note", text:"Regla Zing: el refrigerador, el horno por fuera y el lavavajillas de acero nunca llevan Bar Keepers Friend, aunque tengan manchas. Se limpian con Pledge o agua con Dawn. Una rayadura en un electrodoméstico no se repara."}
  ],
  quiz:[
    {q:"El refrigerador de acero inoxidable tiene una mancha. ¿Usas Bar Keepers Friend?", opts:["Sí, es para acero","No: en electrodomésticos raya. Uso Pledge","Sí, si froto suave"], a:1,
     why:"El acabado cepillado de los electrodomésticos se raya. Bar Keepers Friend va en el fregadero y la porcelana."},
    {q:"¿Cuánto tiempo puede quedarse el producto en la superficie?", opts:["Máximo 1 minuto","10 minutos","Hasta que se seque"], a:0,
     why:"Es un ácido con abrasivo: actúa rápido y se enjuaga. Si se seca deja marca blanca."},
    {q:"¿Cómo se aplica en un fregadero?", opts:["Directo de la botella sobre la superficie seca","Poco producto sobre paño húmedo, frotando con la veta","Mezclado con Clorox"], a:1,
     why:"Superficie húmeda, poco producto, dirección de la veta, y nunca mezclado con cloro."}
  ]},

{ id:"pd-ajax", icon:"🧂", img:"products/ajax-powder-bleach.webp", mins:3,
  t:"Ajax en polvo con cloro",
  lead:"Polvo abrasivo con cloro para porcelana muy sucia: tina, inodoro por dentro, fregadero de porcelana. Es el que más raya.",
  blocks:[
    {k:"h", text:"Para qué sirve"},
    {k:"p", text:"Mugre pegada y anillos en tinas y lavamanos de porcelana esmaltada, interior del inodoro, fregaderos de porcelana o esmalte. El polvo frota; el cloro blanquea."},
    {k:"h", text:"Dónde sí"},
    {k:"check", items:["Tina de porcelana esmaltada o hierro esmaltado","Interior del inodoro","Fregadero de porcelana","Azulejo de cerámica con mugre muy pegada"]},
    {k:"rule", tone:"dont", title:"Nunca en", items:["Piedra natural","Acero inoxidable: raya","Fibra de vidrio ni acrílico (tinas modernas ligeras): raya y opaca","Vidrio, espejos, estufa de vidrio","Grifería","Madera, plástico brillante, superficies pintadas","Mezclado con Zep, Bar Keepers ni ningún ácido: gas tóxico"]},
    {k:"h", text:"Cómo se aplica"},
    {k:"check", items:["Mojar la superficie","Espolvorear poco: una capa ligera, no un montón","Frotar con esponja húmeda en círculos suaves","Dejar actuar 1 a 2 minutos si hay manchas","Enjuagar con mucha agua: el polvo que queda deja residuo blanco","Secar"]},
    {k:"say", text:"Si no sabes si la tina es porcelana o acrílico, golpea suave con el nudillo: la porcelana suena sólida y fría; el acrílico suena hueco y es tibio. Ante la duda, Scrubbing Bubbles."},
    {k:"note", text:"Regla Zing: Ajax se usa en el inodoro por dentro y en tinas de porcelana. Casi nunca en otro lugar. Si no lo necesitas, no lo saques del carrito."}
  ],
  quiz:[
    {q:"La tina suena hueca y se siente tibia al tocarla. ¿Usas Ajax?", opts:["Sí, es una tina","No: es acrílico o fibra de vidrio y el polvo la raya. Uso Scrubbing Bubbles","Sí, con más agua"], a:1,
     why:"Las tinas modernas ligeras se rayan y opacan con polvo abrasivo."},
    {q:"Usaste Ajax en el inodoro y quieres terminar con Zep para el sarro. ¿Puedes?", opts:["Sí, uno tras otro","No: cloro con ácido produce gas tóxico. Enjuago por completo primero","Sí, si es poco"], a:1,
     why:"El cloro del Ajax y el ácido del Zep no se encuentran nunca. Enjuague completo entre uno y otro."},
    {q:"Después de frotar con Ajax queda un velo blanco. ¿Qué pasó?", opts:["Es normal, se quita solo","Faltó enjuagar: el polvo deja residuo","Faltó más polvo"], a:1,
     why:"El polvo que queda seca blanco. Se enjuaga con mucha agua y se seca."}
  ]},

{ id:"pd-degreaser", icon:"🍋", img:"products/zep-citrus-degreaser.webp", mins:3,
  t:"Zep Citrus Degreaser (desengrasante)",
  lead:"Para grasa de cocina: campana, estufa, backsplash, gabinetes junto a la estufa. Se diluye según la suciedad.",
  blocks:[
    {k:"h", text:"Para qué sirve"},
    {k:"p", text:"Grasa acumulada y residuo pegajoso en estufa, campana, filtros, backsplash, azulejo de cocina, botes de basura, pegamento de etiquetas."},
    {k:"h", text:"Dónde sí"},
    {k:"check", items:["Estufa y parrillas (frías)","Campana y filtros metálicos","Backsplash de cerámica o vidrio","Puertas de gabinetes laminados junto a la estufa (probar en esquina)","Botes de basura"]},
    {k:"rule", tone:"dont", title:"Nunca en", items:["Piedra natural sin probar","Madera barnizada o pintada sin enjuagar de inmediato: levanta el acabado","Aluminio sin enjuagar: lo opaca","Telas, alfombras","Dejar que se seque en cualquier superficie"]},
    {k:"h", text:"Cómo se aplica: según la suciedad"},
    {k:"check", items:["Grasa pesada (campana, parrillas): sin diluir","Grasa media (estufa, backsplash): mitad producto, mitad agua","Limpieza ligera (gabinetes): diluido 8 partes de agua por 1 de producto","Rociar, dejar actuar 1 a 2 minutos, frotar con paño verde","Enjuagar con paño húmedo con agua limpia","Secar"]},
    {k:"say", text:"Siempre enjuaga. El desengrasante que se queda deja una película pegajosa que atrae más grasa."},
    {k:"note", text:"Regla Zing: la botella de degreaser diluido del carrito se marca con la dilución (por ejemplo, “1:1”). Nunca una botella sin etiqueta."}
  ],
  quiz:[
    {q:"Vas a limpiar puertas de gabinete laminado con un poco de grasa. ¿Cómo lo diluyes?", opts:["Sin diluir","Mitad y mitad","8 partes de agua por 1 de producto"], a:2,
     why:"Limpieza ligera va muy diluida. El producto fuerte en gabinetes puede dañar el acabado."},
    {q:"Aplicaste degreaser en la campana y se secó antes de que lo frotaras. ¿Qué pasa?", opts:["Nada","Puede dejar mancha o película: se vuelve a mojar, se frota y se enjuaga","Actúa mejor"], a:1,
     why:"Nunca se deja secar. Si pasó, se rehumedece y se enjuaga."},
    {q:"¿Por qué se enjuaga después del desengrasante?", opts:["Por el olor","Porque la película que queda atrae más grasa","No hace falta"], a:1,
     why:"El residuo pegajoso junta polvo y grasa. Enjuague siempre."}
  ]},

{ id:"pd-easyoff", icon:"🔥", img:"products/easy-off-heavy-duty.webp", mins:4,
  t:"Easy-Off Heavy Duty (horno)",
  lead:"El más fuerte del carrito. Solo para el interior del horno, con guantes, ventana abierta y horno frío.",
  blocks:[
    {k:"h", text:"Para qué sirve"},
    {k:"p", text:"Grasa quemada y residuos carbonizados dentro del horno: paredes, base, parrillas e interior de la puerta. Nada más."},
    {k:"h", text:"Dónde sí"},
    {k:"check", items:["Interior del horno: paredes, base, techo","Parrillas del horno (fuera, en el fregadero o sobre plástico)","Interior de la puerta del horno","Interior de la parrilla (broiler)"]},
    {k:"rule", tone:"dont", title:"Nunca en", items:["Resistencias, ventilador, foco ni ningún componente eléctrico","Empaque de goma de la puerta","Exterior del horno ni perillas","Hornos con autolimpieza (self-cleaning) sin confirmar con Zing","Aluminio, cromo, encimeras, pisos, piedra","Horno caliente o tibio"]},
    {k:"h", text:"Cómo se aplica"},
    {k:"check", items:["Horno apagado y frío. Ventana abierta o extractor prendido","Guantes puestos. Poner toallas de papel o plástico en el piso frente al horno","Retirar parrillas","Agitar la lata y rociar a 20–30 cm sobre las superficies sucias, evitando resistencias","Cerrar la puerta y dejar actuar: 5 minutos en suciedad ligera, hasta 30 minutos en suciedad pesada","Limpiar con esponja o paño húmedo. Raspador de plástico para lo pegado","Enjuagar varias veces con paño húmedo hasta que no quede espuma ni olor","Limpiar parrillas aparte, enjuagar y secar antes de devolverlas"]},
    {k:"say", text:"Rociar, cerrar, esperar. Mientras espera, limpia el resto de la cocina."},
    {k:"note", text:"Regla Zing: el horno por dentro es servicio de limpieza profunda (Parte 2, módulo Horno). Si no está en la reserva, no se abre la lata. Si el residente lo pide, se agrega por la app."}
  ],
  quiz:[
    {q:"El horno todavía está tibio de la mañana. ¿Aplicas Easy-Off?", opts:["Sí, funciona mejor caliente","No: horno frío siempre","Sí, con la puerta abierta"], a:1,
     why:"En horno caliente el producto se evapora y los vapores son peligrosos."},
    {q:"¿Dónde no se rocía dentro del horno?", opts:["En las paredes","En resistencias, ventilador y componentes eléctricos","En la base"], a:1,
     why:"El producto en partes eléctricas puede dañar el horno."},
    {q:"Terminaste de limpiar y queda olor a producto. ¿Qué haces?", opts:["Cierro la puerta y listo","Sigo enjuagando con paño húmedo hasta que no quede espuma ni olor","Prendo el horno para que se queme"], a:1,
     why:"El residuo genera humo y olor cuando el residente prenda el horno. Enjuague completo."}
  ]},

{ id:"pd-lysol", icon:"🛡️", img:"products/lysol-all-purpose.webp", mins:3,
  t:"Lysol All-Purpose (multiusos desinfectante)",
  lead:"El multiusos que desinfecta sin cloro. Para las superficies que se tocan mucho.",
  blocks:[
    {k:"h", text:"Para qué sirve"},
    {k:"p", text:"Limpiar y desinfectar superficies duras de contacto frecuente: manijas, interruptores, encimeras de laminado y cuarzo, mesas, botes de basura, sillas altas, cambiadores. No tiene cloro, así que no blanquea."},
    {k:"h", text:"Dónde sí"},
    {k:"check", items:["Manijas de puertas, interruptores, controles","Encimeras de laminado, cuarzo, acero inoxidable","Mesas y sillas de plástico o laminado","Exterior de inodoro, lavamanos","Botes de basura, tapas"]},
    {k:"rule", tone:"dont", title:"Cuidado en", items:["Piedra natural sin probar en una esquina","Madera sin sellar, pisos de madera","Pantallas, teclados, electrónicos (rociar el paño, nunca el aparato)","Telas y cuero","Mezclado con cloro u otros productos"]},
    {k:"h", text:"Cómo se aplica"},
    {k:"check", items:["Rociar directo a 15–20 cm","Para limpiar: pasar paño azul enseguida","Para desinfectar: dejar mojado 2 minutos y luego secar","En superficies de comida: enjuagar con agua","Manijas y objetos pequeños: rociar el paño, no el objeto"]},
    {k:"say", text:"Rocía el paño para manijas, interruptores y cualquier cosa con electricidad."},
    {k:"note", text:"Regla Zing: Lysol es el desinfectante de las zonas azul y verde (habitaciones, sala, cocina). El baño se desinfecta con Clorox o Scrubbing Bubbles, no con Lysol."},
    {k:"h", text:"Las dos botellas son el mismo producto"},
    {k:"p", text:"En el carrito puede haber Lysol All Purpose amarillo (limón) o Lysol Brand New Day naranja (mango e hibisco). Es la misma fórmula con otro aroma; se usa exactamente igual. Si el residente pidió sin fragancia, ninguno de los dos: agua con Dawn."}
  ],
  quiz:[
    {q:"Vas a desinfectar el interruptor de la luz. ¿Cómo aplicas Lysol?", opts:["Rocío directo al interruptor","Rocío el paño y paso el paño","No se desinfecta"], a:1,
     why:"Nunca se rocía líquido sobre nada eléctrico. Se humedece el paño."},
    {q:"¿Cuánto tiempo debe quedar mojada la superficie para desinfectar?", opts:["Se seca al instante","2 minutos","30 minutos"], a:1,
     why:"Desinfectar necesita tiempo de contacto. Limpiar rápido no desinfecta."},
    {q:"¿En qué zonas del apartamento se usa Lysol en Zing?", opts:["Solo en el baño","Habitaciones, sala y cocina: zonas azul y verde","En todo, incluido el inodoro"], a:1,
     why:"El baño lleva Clorox o Scrubbing Bubbles. Lysol va con el paño azul y el verde."}
  ]},

{ id:"pd-mrclean", icon:"🪣", img:"products/mr-clean-antibacterial.webp", mins:3,
  t:"Mr. Clean Antibacterial (concentrado para diluir)",
  lead:"El concentrado del balde: pisos de cerámica, vinilo y laminado, paredes y limpieza general. Siempre se diluye.",
  blocks:[
    {k:"h", text:"Para qué sirve"},
    {k:"p", text:"Limpieza general de pisos duros sellados (cerámica, porcelanato, vinilo, laminado), paredes lavables, puertas, zócalos y superficies grandes. Diluido en balde o en botella."},
    {k:"h", text:"Dónde sí"},
    {k:"check", items:["Pisos de cerámica, porcelanato, vinilo, laminado sellado","Paredes y puertas lavables","Zócalos","Botes de basura, balcón"]},
    {k:"rule", tone:"dont", title:"Nunca en", items:["Pisos de madera: ahí va Bona","Mármol, piedra natural sin probar","Sin diluir sobre una superficie: deja película y marcas","Mezclado con cloro"]},
    {k:"h", text:"Cómo se aplica"},
    {k:"check", items:["Balde: ¼ de taza (60 ml) por cada 4 litros de agua tibia","Botella de spray: 1 parte de producto por 8 de agua para limpieza general","Barrer o aspirar antes de trapear","Trapear del fondo hacia la puerta, con el trapeador bien escurrido","No hace falta enjuagar si está bien diluido","Cambiar el agua cuando se vea sucia"]},
    {k:"say", text:"Trapeador escurrido, no empapado. El piso debe secar en 2 o 3 minutos."},
    {k:"note", text:"Regla Zing: si el piso del apartamento es de madera o parece madera y no estás segura, usa Bona. Bona no daña nada; Mr. Clean en madera sí."}
  ],
  quiz:[
    {q:"¿Cuánto Mr. Clean va en un balde de 4 litros?", opts:["Media botella","¼ de taza (60 ml)","Un chorro sin medir"], a:1,
     why:"Demasiado producto deja película pegajosa y marcas. Se mide."},
    {q:"El piso de la sala parece madera pero podría ser laminado. ¿Qué usas?", opts:["Mr. Clean, por si es laminado","Bona: es seguro para ambos","Clorox diluido"], a:1,
     why:"Ante la duda, Bona. No daña ni madera ni laminado."},
    {q:"¿Cómo debe estar el trapeador?", opts:["Empapado, para limpiar mejor","Bien escurrido: el piso seca en 2 o 3 minutos","Seco"], a:1,
     why:"El agua en exceso daña juntas y laminado y deja marcas."}
  ]},

{ id:"pd-bona", icon:"🪵", img:"products/bona-hardwood.webp", mins:3,
  t:"Bona Hardwood (pisos de madera)",
  lead:"El único producto que va en un piso de madera. Sin diluir, sin enjuagar, sin dejar charcos.",
  blocks:[
    {k:"h", text:"Para qué sirve"},
    {k:"p", text:"Limpiar pisos de madera sellada y barnizada sin dejar residuo ni opacar el acabado. Listo para usar; también sirve en laminado y bambú."},
    {k:"h", text:"Dónde sí"},
    {k:"check", items:["Pisos de madera con acabado de poliuretano (la mayoría de los apartamentos)","Laminado y bambú","Pisos de madera de ingeniería"]},
    {k:"rule", tone:"dont", title:"Nunca en", items:["Madera sin sellar, encerada o aceitada (se ve mate y absorbe el agua): no se moja, solo se barre y se avisa a Zing","Cerámica, vinilo ni piedra: no daña, pero no es su función","Con trapeador empapado ni con agua encima","Con vapor"]},
    {k:"h", text:"Cómo se aplica"},
    {k:"check", items:["Aspirar o barrer bien: la arena raya la madera","Rociar directo sobre el piso, una sección de 1 × 2 m a la vez","Pasar el trapeador de microfibra en la dirección de las tablas","Sin enjuagar, sin secar: se evapora solo","Nunca dejar charcos ni rociar de más"]},
    {k:"say", text:"Poco producto, en la dirección de la madera, y el piso seca solo en un minuto."},
    {k:"note", text:"Regla Zing: si una gota de agua en el piso de madera se absorbe y oscurece en vez de quedarse encima, el piso no está sellado. No se limpia con líquido. Se aspira, se fotografía y se avisa a Zing."}
  ],
  quiz:[
    {q:"¿Qué haces antes de rociar Bona en el piso?", opts:["Mojar el piso","Aspirar o barrer bien: la arena raya","Aplicar Mr. Clean primero"], a:1,
     why:"La arena y el polvo se convierten en lija bajo el trapeador."},
    {q:"Una gota de agua en el piso de madera se absorbe y oscurece. ¿Qué haces?", opts:["Limpio rápido con Bona","No lo mojo: aspiro, fotografío y aviso a Zing","Uso más producto para sellarlo"], a:1,
     why:"Un piso sin sellar absorbe líquido y se mancha. Solo se aspira y se reporta."},
    {q:"¿Se enjuaga Bona después de trapear?", opts:["Sí, con agua limpia","No: se evapora solo","Sí, con Mr. Clean"], a:1,
     why:"Bona no deja residuo. Enjuagar con agua es lo que daña la madera."}
  ]},

{ id:"pd-weiman", icon:"🪨", core:true, img:"products/weiman-quartz-stone.webp", mins:3,
  t:"Weiman para encimeras (cuarzo, granito, mármol)",
  lead:"El único producto que va sobre encimeras de piedra. Limpia, brilla y protege sin dañar el sellador.",
  blocks:[
    {k:"h", text:"Para qué sirve"},
    {k:"p", text:"Limpieza diaria de encimeras de granito, mármol, cuarzo, cuarcita y otras piedras selladas: quita huellas, grasa ligera y manchas de comida sin opacar ni rayar. Deja una capa protectora."},
    {k:"h", text:"Dónde sí"},
    {k:"check", items:["Encimeras de cocina de granito, cuarzo, mármol","Tocadores de baño de piedra","Mesas de piedra","Backsplash de piedra"]},
    {k:"rule", tone:"dont", title:"No es para", items:["Manchas de óxido o sarro pegado en piedra: eso se reporta a Zing, no se ataca con ácido","Laminado ni madera: no daña, pero no es su función","Piso de piedra: se usa agua con Dawn en balde"]},
    {k:"h", text:"Cómo se aplica"},
    {k:"check", items:["Retirar migas y objetos","Rociar directo sobre la encimera","Pasar paño de microfibra verde (cocina) o amarillo (baño) de inmediato","Secar y pulir con un paño seco para el brillo","Sin enjuagar"]},
    {k:"say", text:"Toda encimera de piedra: Weiman y nada más. Sin excepción, sin “solo esta vez”."},
    {k:"note", text:"Regla Zing: un anillo blanco o una zona opaca en una encimera de piedra normalmente viene de un ácido (limón, vinagre, un limpiador de baño). Si lo encuentras al llegar, fotografía y avisa antes de empezar, para que no parezca que fuimos nosotros."}
  ],
  quiz:[
    {q:"La encimera de granito tiene una mancha de óxido bajo una lata. ¿Qué haces?", opts:["Bar Keepers Friend, quita óxido","Limpio con Weiman lo que salga y reporto la mancha a Zing","Zep Shower Tub & Tile"], a:1,
     why:"Nada ácido toca la piedra. La mancha se reporta y Zing decide."},
    {q:"¿Qué paño usas con Weiman en el tocador del baño?", opts:["Rojo","Amarillo: es baño, pero no inodoro","Verde"], a:1,
     why:"El sistema de colores aplica con cualquier producto. Tocador de baño va con amarillo."},
    {q:"Al llegar ves un anillo opaco en la encimera de mármol. ¿Qué haces primero?", opts:["Trato de pulirlo","Lo fotografío y aviso antes de empezar","Lo tapo con un objeto"], a:1,
     why:"Un daño que ya existía se documenta al llegar. Así queda claro que no fue durante el servicio."}
  ]},

{ id:"pd-windex", icon:"🪟", img:"products/windex-original.webp", mins:3,
  t:"Windex Original (vidrios y espejos)",
  lead:"Para vidrio, espejos y superficies brillantes. Tiene amoníaco: nunca junto a productos con cloro.",
  blocks:[
    {k:"h", text:"Para qué sirve"},
    {k:"p", text:"Espejos, ventanas interiores, puertas de vidrio, mesas de vidrio, mamparas de ducha (después de limpiarlas), pantallas de vitrocerámica frías, cromo brillante."},
    {k:"h", text:"Dónde sí"},
    {k:"check", items:["Espejos de baño y habitación","Ventanas por dentro y puertas de balcón","Mesas y repisas de vidrio","Puertas de ducha ya limpias, para el brillo final","Marcos de fotos con vidrio (rociar el paño)"]},
    {k:"rule", tone:"dont", title:"Nunca en", items:["Pantallas de TV, computadoras ni teléfonos: el amoníaco daña el recubrimiento","Espejos antiguos con marco de madera: rociar el paño, no el espejo","Piedra natural, madera, cuero","Ventanas al sol directo: se seca antes de secarlo y deja rayas","Mezclado ni cerca de Clorox, Scrubbing Bubbles o Ajax: amoníaco + cloro = gas tóxico"]},
    {k:"h", text:"Cómo se aplica"},
    {k:"check", items:["Quitar el polvo del vidrio y el marco primero (en seco)","Rociar poco, directo sobre el vidrio","Pasar paño de microfibra azul en forma de S, de arriba hacia abajo","Terminar con un paño seco para las rayas","Revisar desde un ángulo con luz"]},
    {k:"say", text:"Espejo del baño: primero termina el inodoro y la ducha, enjuaga, y al final Windex. Nunca al revés."},
    {k:"note", text:"Regla Zing: en el baño, el Windex se usa cuando ya no queda nada de cloro en el aire ni en las superficies. Es lo último que se hace antes de salir del baño."}
  ],
  quiz:[
    {q:"El residente pidió limpiar la pantalla del televisor. ¿Usas Windex?", opts:["Sí, es vidrio","No: el amoníaco daña la pantalla. Paño de microfibra seco","Sí, rociando el paño"], a:1,
     why:"Las pantallas no llevan Windex ni ningún producto con amoníaco o alcohol."},
    {q:"Acabas de rociar Scrubbing Bubbles en la ducha y quieres hacer el espejo. ¿Qué haces?", opts:["Rocío Windex en el espejo","Espero, termino la ducha, enjuago, y el espejo va al final","Uso Scrubbing Bubbles en el espejo"], a:1,
     why:"Amoníaco y cloro en el mismo baño al mismo tiempo producen gas tóxico. El espejo es lo último."},
    {q:"Quedan rayas en la ventana. ¿Qué faltó?", opts:["Más producto","Terminar con paño seco y revisar con luz de lado","Rociar agua"], a:1,
     why:"El paño seco final quita las rayas. Se revisa desde un ángulo con luz."}
  ]},

{ id:"pd-pledge", icon:"🌿", img:"products/pledge-dust-allergen.webp", mins:3,
  t:"Pledge Dust & Allergen multisuperficie",
  lead:"Para quitar el polvo sin regarlo: muebles, electrodomésticos de acero, madera barnizada. Rociar el paño, no el mueble.",
  blocks:[
    {k:"h", text:"Para qué sirve"},
    {k:"p", text:"Atrapar polvo y alérgenos en muebles de madera, laminado, acero inoxidable de electrodomésticos, plástico, marcos y electrónicos por fuera. Deja un acabado uniforme y no engrasa."},
    {k:"h", text:"Dónde sí"},
    {k:"check", items:["Mesas, repisas, mesas de noche, cabeceras","Refrigerador, lavavajillas, microondas por fuera (acero inoxidable)","Marcos de puertas y ventanas","Persianas","Exterior de TV y equipos (rociar el paño)"]},
    {k:"rule", tone:"dont", title:"Nunca en", items:["Pisos: quedan resbalosos y es peligroso","Pantallas","Cuero, telas, tapicería","Muebles antiguos con cera o aceite: solo paño seco","Vidrio: deja película (ahí va Windex)"]},
    {k:"h", text:"Cómo se aplica"},
    {k:"check", items:["Rociar el paño azul de microfibra, no la superficie","Levantar cada objeto, pasar el paño, limpiar el objeto, devolverlo al mismo lugar","Acero inoxidable: pasar en la dirección de la veta","Terminar con la parte seca del paño","No hace falta enjuagar"]},
    {k:"say", text:"Pledge en el paño. Nunca una nube sobre el mueble: cae al piso y lo hace patinar."},
    {k:"note", text:"Regla Zing: el frente de los electrodomésticos de acero inoxidable se limpia con Pledge y paño con la veta. Ni Bar Keepers, ni Ajax, ni Windex directo."}
  ],
  quiz:[
    {q:"¿Cómo aplicas Pledge en una mesa de noche?", opts:["Rocío la mesa y paso el paño","Rocío el paño y paso el paño","Rocío y dejo secar"], a:1,
     why:"Producto en el paño. Lo que cae al piso lo deja resbaloso."},
    {q:"El refrigerador de acero tiene huellas. ¿Qué usas?", opts:["Bar Keepers Friend","Pledge en paño, en la dirección de la veta","Windex directo"], a:1,
     why:"Los electrodomésticos de acero llevan Pledge con la veta. Los abrasivos rayan."},
    {q:"Cayó Pledge en el piso de madera. ¿Qué haces?", opts:["Lo dejo, le da brillo","Lo limpio de inmediato con Bona: el piso queda resbaloso","Lo seco con el pie"], a:1,
     why:"Pledge en el piso es un riesgo de caída para el residente."}
  ]},

{ id:"pd-odoban", icon:"🌬️", img:"products/odoban-eucalyptus.webp", mins:3,
  t:"OdoBan (eliminador de olores, eucalipto)",
  lead:"Concentrado que quita olores y desinfecta telas y superficies. Se diluye siempre; el olor del apartamento al final es parte del servicio.",
  blocks:[
    {k:"h", text:"Para qué sirve"},
    {k:"p", text:"Eliminar olores de mascota, humedad, basura y humo en alfombras, tapicería, cortinas, colchones, botes de basura, baños y aire del ambiente. Diluido también desinfecta superficies duras."},
    {k:"h", text:"Dónde sí"},
    {k:"check", items:["Alfombras y tapetes (neblina ligera)","Sofás y colchones de tela (probar en una esquina)","Botes de basura por dentro","Cortina de ducha y baño en general","Aire del ambiente al terminar"]},
    {k:"rule", tone:"dont", title:"Nunca en", items:["Cuero, seda, lana ni telas delicadas","Madera sin sellar, piedra natural","Sin diluir sobre nada: mancha","Cerca de mascotas o de su comida y agua mientras está húmedo","Mezclado con otros productos"]},
    {k:"h", text:"Cómo se aplica"},
    {k:"check", items:["Diluir: 1 parte de producto en 4 de agua para olores fuertes; 1 en 30 para telas y ambiente","Marcar la botella con la dilución","Telas: neblina ligera a 30 cm, sin empapar. Dejar secar al aire","Botes de basura: rociar por dentro, dejar 1 minuto, secar","Ambiente: dos o tres disparos al aire al terminar la visita, nunca hacia muebles"]},
    {k:"say", text:"Neblina, no chorro. Si la tela se ve mojada, fue demasiado."},
    {k:"note", text:"Regla Zing: el toque final de aroma es parte del Momento Zing (Parte 1). Si el residente pidió sin fragancia o tiene alergias en sus notas, se omite."}
  ],
  quiz:[
    {q:"El sofá huele a perro. ¿Cómo aplicas OdoBan?", opts:["Sin diluir, directo","Diluido 1 en 30, neblina ligera después de probar en una esquina","Empapando bien la tela"], a:1,
     why:"Diluido y en neblina. Empapar mancha y tarda en secar."},
    {q:"El residente pidió “sin fragancias” en sus notas. ¿Rocías el ambiente al terminar?", opts:["Sí, es parte del servicio","No: se omite","Solo un poco"], a:1,
     why:"Las notas del residente mandan. El aroma final se omite si lo pidió."},
    {q:"¿Qué debe tener la botella de OdoBan diluido del carrito?", opts:["Nada especial","La dilución escrita en la etiqueta","Solo el color de la tapa"], a:1,
     why:"Ninguna botella sin etiqueta ni sin dilución. Es seguridad y consistencia."}
  ]},

{ id:"pd-dawn", icon:"🫧", img:"products/dawn-platinum-powersuds.webp", mins:2,
  t:"Dawn Platinum (jabón para platos)",
  lead:"El producto más seguro del carrito y el que resuelve más cosas: platos, grasa, y cualquier superficie de la que no estés segura.",
  blocks:[
    {k:"h", text:"Para qué sirve"},
    {k:"p", text:"Lavar platos y ollas, quitar grasa de la estufa, y limpieza suave de superficies delicadas donde ningún otro producto es seguro: piedra natural, grifería dorada, tinas de acrílico, juguetes, tablas de madera."},
    {k:"h", text:"Dónde sí"},
    {k:"check", items:["Platos, vasos, ollas y sartenes","Estufa y parrillas engrasadas (remojo)","Grifería delicada, dorada o de latón","Tinas de acrílico y fibra de vidrio","Cualquier superficie de la que no sepas el material","Pisos de piedra (en balde, poca cantidad)"]},
    {k:"rule", tone:"dont", title:"Cuidado", items:["Demasiado jabón deja película: unas gotas bastan","Nunca en el lavavajillas: hace espuma y se desborda","Enjuagar siempre; el residuo queda pegajoso"]},
    {k:"h", text:"Cómo se aplica"},
    {k:"check", items:["Platos: unas gotas en esponja o en agua caliente","Superficies: 3 o 4 gotas en 1 litro de agua tibia, paño escurrido","Grasa pegada: unas gotas directo, dejar 5 minutos, frotar, enjuagar","Enjuagar con agua limpia y secar"]},
    {k:"say", text:"Cuando no sabes qué usar, agua tibia con Dawn nunca daña nada."},
    {k:"note", text:"Regla Zing: la esponja de platos es solo para platos. Nunca toca el fregadero por fuera, la estufa ni la encimera. Para eso están los paños verdes."}
  ],
  quiz:[
    {q:"Una grifería dorada tiene manchas de agua. ¿Qué usas?", opts:["Bar Keepers Friend","Zep Shower Tub & Tile","Agua tibia con Dawn y secar bien"], a:2,
     why:"Los ácidos manchan acabados dorados. Dawn y secado."},
    {q:"¿Cuánto Dawn va en 1 litro de agua para limpiar superficies?", opts:["Medio vaso","3 o 4 gotas","Un chorro largo"], a:1,
     why:"Más jabón no limpia más; deja película pegajosa."},
    {q:"¿Puede la esponja de platos limpiar la estufa?", opts:["Sí, es la cocina","No: la esponja es solo para platos. La estufa va con paño verde","Sí, si la enjuago"], a:1,
     why:"La esponja que toca comida no toca superficies. Contaminación cruzada."}
  ]},

{ id:"pd-microfibra", icon:"🧻", img:"products/microfiber-cloths.webp", mins:3,
  t:"Paños de microfibra: cómo se usan y se cuidan",
  lead:"El paño hace la mitad del trabajo. Un paño sucio o mal lavado regresa la mugre a la superficie.",
  blocks:[
    {k:"h", text:"Para qué sirven"},
    {k:"p", text:"La microfibra atrapa polvo, grasa y bacterias por sí sola, con poca agua y poco producto. Un paño limpio de microfibra con agua limpia mejor que un trapo común con producto."},
    {k:"h", text:"Colores (Parte 3)"},
    {k:"check", items:["🔴 Rojo: inodoro","🟡 Amarillo: resto del baño","🟢 Verde: cocina","🔵 Azul: todo lo demás"]},
    {k:"h", text:"Cómo se usa"},
    {k:"check", items:["Doblar en cuatro: ocho caras limpias por paño","Cambiar de cara cuando se ensucie; cambiar de paño cuando no quede cara limpia","Húmedo y escurrido para limpiar; seco para pulir y secar","Un paño por zona, nunca cruza","Los sucios van a la bolsa de sucios del carrito, no de regreso al estante"]},
    {k:"rule", tone:"dont", title:"Nunca", items:["Lavar con suavizante ni con cloro: la fibra deja de atrapar","Secar a temperatura alta: se derrite","Lavar junto con toallas de algodón: se llena de pelusa","Usar un paño de piso para cualquier otra cosa"]},
    {k:"h", text:"Cómo se lavan"},
    {k:"check", items:["Solo microfibra en la carga","Agua caliente, detergente normal, sin suavizante","Secadora en baja o al aire","Un paño que huele mal después de lavar se descarta y se pide reemplazo"]},
    {k:"note", text:"Regla Zing: revisa tus paños al inicio de la semana. Con hilos sueltos, rígidos o manchados, se piden nuevos. Nunca esperes a quedarte sin paños limpios."}
  ],
  quiz:[
    {q:"¿Qué le hace el suavizante a la microfibra?", opts:["La deja más suave y limpia mejor","Tapa la fibra y deja de atrapar polvo","Nada"], a:1,
     why:"Suavizante y cloro arruinan la microfibra. Detergente normal, agua caliente, secado en baja."},
    {q:"El paño amarillo ya no tiene caras limpias y falta el lavamanos. ¿Qué haces?", opts:["Lo enjuago y sigo","Tomo otro paño amarillo limpio; el sucio va a la bolsa de sucios","Uso el azul"], a:1,
     why:"Paño nuevo del mismo color. Nunca se cruza de zona ni se reutiliza uno saturado."},
    {q:"¿Cuántas caras limpias tiene un paño doblado en cuatro?", opts:["Dos","Cuatro","Ocho"], a:2,
     why:"Doblar en cuatro da ocho caras. Se cambia de cara antes de cambiar de paño."}
  ]},

].concat(window.PRODUCTS_MORE || []).concat([
{ id:"pd-aspiradora", icon:"🔌", img:"products/eureka-canister-vacuum.webp", mins:3,
  t:"La aspiradora Eureka (canister sin bolsa)",
  lead:"Se usa en cada visita y se limpia en cada visita. Una aspiradora con el depósito lleno no aspira y huele.",
  blocks:[
    {k:"h", text:"Para qué sirve"},
    {k:"p", text:"Alfombras, tapetes, pisos duros (con el cepillo retraído), sofás, colchones, esquinas, zócalos y detrás de puertas. Es lo primero que pasa por el piso antes de trapear."},
    {k:"h", text:"Accesorios"},
    {k:"check", items:["Boquilla de piso: alfombras y pisos. Cepillo afuera en alfombra, adentro en piso duro","Boquilla plana (crevice): esquinas, zócalos, entre cojines, rieles de ventana","Cepillo redondo: persianas, lámparas, polvo alto","Tubo de extensión: techo, telarañas, arriba de gabinetes"]},
    {k:"rule", tone:"dont", title:"Nunca", items:["Aspirar líquidos, vidrio roto, cenizas ni polvo fino de construcción","Aspirar cables, cordones de cortinas ni borlas de tapetes","Pasar con el cepillo girando sobre piso de madera: raya","Jalarla del cable ni enrollar el cable mojado","Dejarla en el pasillo bloqueando el paso"]},
    {k:"h", text:"Cada visita"},
    {k:"check", items:["Revisar que el depósito esté vacío antes de empezar","Vaciar el depósito en la basura del carrito al terminar, nunca en la del residente","Sacudir el filtro fuera del apartamento","Limpiar el exterior con paño azul","Enrollar el cable y guardar los accesorios en su lugar"]},
    {k:"h", text:"Cada semana"},
    {k:"check", items:["Lavar el filtro con agua (sin jabón) y dejar secar 24 horas antes de volver a ponerlo","Revisar el cepillo y cortar pelos y hilos enredados","Revisar la manguera: si pierde succión, hay algo atorado"]},
    {k:"say", text:"Aspiradora limpia por fuera, vacía por dentro. Es parte del carrito que el residente ve."},
    {k:"note", text:"Regla Zing: si pierde succión, hace ruido raro u olor a quemado, se deja de usar y se reporta ese mismo día. Nunca se fuerza."}
  ],
  quiz:[
    {q:"Vas a aspirar el piso de madera de la sala. ¿Cómo va el cepillo?", opts:["Girando, limpia mejor","Retraído o apagado: girando raya la madera","Da igual"], a:1,
     why:"El cepillo giratorio es para alfombra. En piso duro se retrae."},
    {q:"¿Dónde vacías el depósito al terminar?", opts:["En la basura del residente","En la basura del carrito","La próxima semana"], a:1,
     why:"La basura de la aspiradora es de Zing, no del residente. Se vacía en cada visita."},
    {q:"La aspiradora perdió succión a media visita. ¿Qué haces?", opts:["Sigo, aunque aspire menos","Reviso depósito y manguera; si sigue igual, dejo de usarla y reporto","La golpeo un poco"], a:1,
     why:"Primero lo básico: depósito y manguera. Si no se resuelve, se reporta ese día."}
  ]}
  ])};
