/* Zing Onboarding v2 · vías adicionales (educación continua, tras la certificación)
   Se muestran en "Mi entrenamiento" debajo de Parte 1 y Parte 2. Mismo formato que ops.js:
   { id, t, icon, mins, lead, blocks:[…], quiz:[…] }. Bloques: p · h · check · rule(do|dont) · say · note.
   Mientras un track no tenga módulos, la app muestra "Contenido en preparación".
   Parte 3 sigue las recomendaciones del CDC (limpieza ambiental, higiene de manos) y OSHA (químicos). */
window.EXTRA_TRACKS = [
{ key: "safety", icon: "🛡️", label: "Parte 3 · Seguridad e Higiene", blurb: "Protocolos para cuidarte a ti, al hogar y al cliente.",
  modules: [
{ id:"sh-colores", icon:"🧻", mins:4,
  t:"Regla #1: nunca mover gérmenes de un área a otra",
  lead:"Es la regla más importante de toda esta parte. Un paño que limpió el inodoro no puede tocar nada más.",
  blocks:[
    {k:"p", text:"El CDC recomienda paños de colores para evitar la contaminación cruzada entre áreas: empezar con un paño limpio, cambiarlo cuando se ensucie y avanzar de las zonas más limpias hacia las más sucias. En Zing usamos un sistema de cuatro colores y nunca nos desviamos de él."},
    {k:"h", text:"El sistema de colores Zing"},
    {k:"check", items:[
      "🔴 ROJO — solo inodoros y el área del inodoro",
      "🟡 AMARILLO — resto del baño: lavamanos, ducha, tina, tocador",
      "🟢 VERDE — cocina",
      "🔵 AZUL — todo lo demás: habitaciones, sala, muebles, superficies generales"
    ]},
    {k:"say", text:"Cuando un paño entra a su zona, nunca entra a otra zona."},
    {k:"rule", tone:"dont", title:"Nunca", items:[
      "Un paño rojo de inodoro toca el lavamanos del baño",
      "Un paño de baño toca la encimera de la cocina",
      "Un paño de cocina toca la mesa del comedor o un mueble de la habitación"
    ]},
    {k:"h", text:"Los guantes también contaminan"},
    {k:"p", text:"Usar guantes no convierte manos sucias en manos limpias. Si acabas de limpiar un inodoro y con esos mismos guantes tocas la manija de un gabinete de cocina, acabas de trasladar la contaminación."},
    {k:"note", text:"Si dudas de qué color va en una superficie, pregúntate: ¿esto es inodoro, baño, cocina o “lo demás”? Siempre hay una sola respuesta."}
  ],
  quiz:[
    {q:"¿Para qué se usa únicamente el paño rojo?", opts:["Para todo el baño","Solo inodoros y el área del inodoro","Para la cocina"], a:1,
     why:"El rojo es exclusivo del inodoro. El resto del baño —lavamanos, ducha, tina— va con amarillo."},
    {q:"Terminaste el inodoro con guantes puestos. ¿Puedes abrir un gabinete de la cocina con esos guantes?", opts:["Sí, los guantes protegen la superficie","No: los guantes trasladan gérmenes igual que las manos","Solo si el guante se ve limpio"], a:1,
     why:"Los guantes se contaminan igual que la piel. Cámbialos y lávate las manos antes de pasar a otra zona."},
    {q:"¿Con qué color se limpia la mesa del comedor?", opts:["🟢 Verde, porque está cerca de la cocina","🟡 Amarillo","🔵 Azul: superficies generales"], a:2,
     why:"La mesa del comedor es una superficie general. El verde es solo para la cocina."}
  ]},

{ id:"sh-orden", icon:"⬇️", mins:3,
  t:"De limpio a sucio. De arriba hacia abajo. Pisos al final.",
  lead:"Una sola frase que resume el orden correcto de cualquier visita. El CDC la recomienda porque, si no, contaminas lo que ya limpiaste.",
  blocks:[
    {k:"say", text:"LIMPIO → SUCIO. ARRIBA → ABAJO. PISO AL FINAL."},
    {k:"h", text:"En un apartamento"},
    {k:"check", items:["Sala y habitaciones","Cocina","Baño","Inodoro","Pisos"]},
    {k:"h", text:"Dentro de cada área"},
    {k:"check", items:["Superficies altas","Encimeras y muebles","Superficies bajas","Piso"]},
    {k:"rule", tone:"dont", title:"Nunca", items:[
      "Limpiar el inodoro y después volver a pasar un paño por una mesa de noche",
      "Trapear y después sacudir el polvo de algo que está encima del piso recién limpio"
    ]},
    {k:"note", text:"Si te saltaste algo en una zona limpia, vuelve con un paño limpio del color correcto y guantes nuevos. Nunca con lo que traes de la zona sucia."}
  ],
  quiz:[
    {q:"¿Cuál es el orden correcto en un apartamento?", opts:["Baño → cocina → habitaciones → pisos","Sala y habitaciones → cocina → baño → inodoro → pisos","Pisos → cocina → baño → habitaciones"], a:1,
     why:"De lo más limpio a lo más sucio, y los pisos al final para recoger todo lo que cayó."},
    {q:"Ya trapeaste y notas polvo en una repisa. ¿Qué haces?", opts:["Sacudo la repisa rápido, es poco polvo","Limpio la repisa con paño y vuelvo a pasar por el piso de esa zona","Lo dejo así"], a:1,
     why:"Arriba → abajo siempre. Si limpias algo encima de un piso ya trapeado, ese piso hay que repasarlo."}
  ]},

{ id:"sh-panos", icon:"🧼", mins:3,
  t:"Manejo de paños limpios",
  lead:"Cada apartamento empieza con paños limpios. Y una vez que un paño se usó, no vuelve a ser “limpio” hasta que se lava.",
  blocks:[
    {k:"p", text:"El CDC recomienda doblar y rotar el paño de microfibra para ir exponiendo caras limpias mientras trabajas, y reemplazarlo cuando se usaron todas las caras o se ensució."},
    {k:"h", text:"El carrito tiene dos zonas separadas"},
    {k:"check", items:["PAÑOS LIMPIOS","PAÑOS USADOS"]},
    {k:"say", text:"Cuando un paño entra a USADOS, no vuelve a salir durante el turno."},
    {k:"rule", tone:"dont", title:"Nunca", items:[
      "Devolver un paño usado con los limpios",
      "Meter un paño sucio de nuevo en la solución de limpieza",
      "Dejar paños húmedos y sucios sobre el carrito",
      "Reusar un paño de inodoro en otro lugar",
      "Llevar un paño de un apartamento a otro sin lavarlo"
    ]},
    {k:"note", text:"Los paños y las cabezas de mop reutilizables se lavan y se dejan secar antes de volver a usarse. Nunca se guardan mojados ni en solución contaminada."}
  ],
  quiz:[
    {q:"Te quedaste sin paños azules y hay uno usado que “se ve limpio”. ¿Qué haces?", opts:["Lo enjuago en la solución y lo uso","No lo uso: pido o busco un paño limpio","Lo uso solo en superficies bajas"], a:1,
     why:"Un paño usado no vuelve a salir de USADOS durante el turno. Enjuagarlo en la solución además contamina la solución."},
    {q:"¿Puedes llevar los paños que usaste en un apartamento al siguiente?", opts:["Sí, si son del mismo color","Solo los de habitaciones","No, sin lavarlos nunca"], a:2,
     why:"Cada apartamento empieza con paños limpios. Los usados van a USADOS hasta que se laven."}
  ]},

{ id:"sh-manos", icon:"🧤", mins:4,
  t:"Manos y guantes",
  lead:"Los guantes son por tarea, no por apartamento. Y lavarse las manos sigue siendo obligatorio aunque los uses.",
  blocks:[
    {k:"h", text:"Lávate o desinfecta las manos"},
    {k:"check", items:[
      "Antes de empezar en un apartamento",
      "Después de quitarte los guantes",
      "Después de limpiar un inodoro",
      "Después de manejar basura",
      "Después de manejar ropa sucia",
      "Después de contacto con fluidos corporales",
      "Antes de tocar cualquier cosa relacionada con comida",
      "Antes de comer o beber",
      "Al terminar la visita"
    ]},
    {k:"p", text:"Agua y jabón es lo preferido. Si no hay, el CDC recomienda desinfectante de manos con al menos 60% de alcohol."},
    {k:"h", text:"Guantes por tarea"},
    {k:"say", text:"Inodoro → quitar guantes → lavar o desinfectar manos → guantes nuevos antes de otra tarea sensible."},
    {k:"rule", tone:"dont", title:"Con guantes sucios nunca", items:["Tocar tu cara","Tocar tu teléfono","Tocar comida o bebida"]}
  ],
  quiz:[
    {q:"¿Los guantes son por apartamento o por tarea?", opts:["Por apartamento: un par por visita","Por tarea: se cambian entre tareas sensibles","Por día"], a:1,
     why:"Después del inodoro o la basura: guantes fuera, manos limpias, guantes nuevos."},
    {q:"No hay agua ni jabón disponibles. ¿Qué usas?", opts:["Desinfectante con al menos 60% de alcohol","Un paño húmedo","Nada, los guantes bastan"], a:0,
     why:"Cuando no hay agua y jabón, el CDC recomienda desinfectante de manos con 60% de alcohol o más."},
    {q:"Te suena el teléfono mientras limpias el baño con guantes. ¿Qué haces?", opts:["Contesto rápido con los guantes","Me quito los guantes y me limpio las manos antes de tocarlo","Contesto con el codo"], a:1,
     why:"El teléfono es una de las cosas que más se contamina. Nunca se toca con guantes sucios."}
  ]},

{ id:"sh-quimicos", icon:"⚠️", mins:4,
  t:"Químicos: nunca improvisar",
  lead:"Regla dura. OSHA advierte que mezclar productos —sobre todo cloro y amoníaco— puede producir gases peligrosos.",
  blocks:[
    {k:"h", text:"El estándar Zing"},
    {k:"check", items:[
      "Solo productos aprobados por Zing",
      "Nunca mezclar productos",
      "Nunca crear tu propia mezcla",
      "Nunca pasar un químico a un envase sin etiqueta",
      "Nunca adivinar las diluciones"
    ]},
    {k:"say", text:"Sigue la etiqueta del fabricante. Siempre."},
    {k:"h", text:"Ventilación y protección"},
    {k:"p", text:"Si el producto requiere ventilación, abre una ventana o puerta o asegura flujo de aire donde sea posible. Si la etiqueta pide guantes o protección para los ojos, úsalos."},
    {k:"note", text:"Debes saber dónde está la información de seguridad (SDS) de cada químico de Zing. Si no lo sabes, pregúntale a tu supervisora hoy."}
  ],
  quiz:[
    {q:"Una mancha no sale con el producto aprobado. ¿Qué haces?", opts:["Le agrego un poco de cloro para reforzarlo","No mezclo: sigo la etiqueta y, si no sale, aviso a la oficina","Pruebo con un producto del residente"], a:1,
     why:"Nunca se mezclan productos ni se improvisa. Cloro + amoníaco, por ejemplo, genera gases tóxicos."},
    {q:"Se acabó el envase original y te queda producto en una botella sin etiqueta. ¿Puedes usarla?", opts:["Sí, si recuerdas qué es","No: ningún químico va en un envase sin etiqueta","Solo en el baño"], a:1,
     why:"Sin etiqueta no hay forma segura de saber qué es, cómo se diluye ni cómo reaccionará."},
    {q:"La etiqueta pide protección para los ojos. ¿Qué haces?", opts:["La uso","Es opcional si tengo cuidado","Solo si el residente está presente"], a:0,
     why:"Lo que pide la etiqueta no es opcional."}
  ]},

{ id:"sh-desinfectar", icon:"⏱️", mins:3,
  t:"Limpiar no es desinfectar",
  lead:"Rociar desinfectante y secarlo de inmediato no desinfecta. El producto necesita tiempo de contacto.",
  blocks:[
    {k:"h", text:"La diferencia según el CDC"},
    {k:"check", items:["LIMPIAR quita la suciedad y la mayoría de los gérmenes","DESINFECTAR usa químicos para matar los gérmenes que quedan"]},
    {k:"p", text:"En un hogar normal, la limpieza de rutina generalmente es suficiente. Desinfectar cobra importancia cuando alguien está enfermo o hay circunstancias de mayor riesgo."},
    {k:"h", text:"Cuando sí desinfectas"},
    {k:"say", text:"La superficie debe permanecer húmeda durante el tiempo de contacto que indica la etiqueta."},
    {k:"note", text:"Rociar y secar de inmediato puede no desinfectar la superficie. Rocía, deja actuar el tiempo indicado y sigue con otra cosa mientras esperas."}
  ],
  quiz:[
    {q:"¿Qué hace la limpieza y qué hace la desinfección?", opts:["Son lo mismo","Limpiar quita suciedad y la mayoría de gérmenes; desinfectar mata los que quedan","Desinfectar quita la suciedad"], a:1,
     why:"Primero se limpia, después —si aplica— se desinfecta."},
    {q:"Rocías desinfectante en la encimera y la secas de inmediato. ¿Quedó desinfectada?", opts:["Sí","Probablemente no: faltó el tiempo de contacto de la etiqueta","Solo si usaste mucho producto"], a:1,
     why:"El desinfectante necesita permanecer húmedo el tiempo que indica la etiqueta para hacer efecto."}
  ]},

{ id:"sh-fluidos", icon:"🛑", mins:2,
  t:"Fluidos corporales: condición de PARAR",
  lead:"Sangre, vómito, heces, agujas o contaminación importante por fluidos no son limpieza normal.",
  blocks:[
    {k:"say", text:"PARA. NO LIMPIES COMO SIEMPRE. CONTACTA A TU SUPERVISORA."},
    {k:"p", text:"Esa situación puede requerir otra protección, otros productos y otro procedimiento. El CDC trata los derrames de sangre y fluidos corporales aparte de la limpieza ambiental de rutina."},
    {k:"note", text:"Esta regla también te protege a ti: no tienes que tomar una decisión para la que no fuiste entrenada. Avisar es lo correcto, siempre."}
  ],
  quiz:[
    {q:"Encuentras sangre en el baño. ¿Qué haces?", opts:["La limpio con el paño rojo y desinfectante","Paro, no limpio como siempre y contacto a mi supervisora","La cubro con una toalla y sigo"], a:1,
     why:"Sangre, vómito, heces o agujas son una condición de PARAR. Requieren otro protocolo."},
    {q:"Ves una aguja en el piso de la habitación. ¿La recoges?", opts:["Sí, con guantes","No: es condición de parar y avisar","Sí, con la aspiradora"], a:1,
     why:"Nunca manipules agujas ni objetos punzantes. Para y avisa."}
  ]},

{ id:"sh-basura", icon:"🗑️", mins:3,
  t:"Basura y ropa sucia",
  lead:"La basura es una tarea de zona sucia, y la ropa sucia nunca toca superficies limpias ni el carrito.",
  blocks:[
    {k:"h", text:"Después de manejar basura"},
    {k:"check", items:["Quitar guantes","Lavar o desinfectar manos","Guantes nuevos si sigues trabajando"]},
    {k:"rule", tone:"dont", title:"Nunca", items:["Comprimir bolsas de basura con las manos: puede haber objetos cortantes adentro"]},
    {k:"h", text:"Ropa sucia"},
    {k:"p", text:"La ropa sucia no se coloca sobre superficies limpias ni sobre el carrito. Después de manejarla, lávate las manos —el CDC lo recomienda incluso si usaste guantes en situaciones de mayor riesgo."}
  ],
  quiz:[
    {q:"La bolsa de basura está muy llena. ¿La aprietas con las manos para que quepa?", opts:["Sí, con guantes","No: puede haber objetos cortantes adentro","Solo si es basura de cocina"], a:1,
     why:"Nunca comprimas basura con las manos. Cambia la bolsa o usa una segunda."},
    {q:"¿Dónde puedes apoyar la ropa sucia mientras la llevas a la lavadora?", opts:["Sobre la cama","Sobre el carrito","En ningún lugar limpio: va directo a la lavadora o canasta"], a:2,
     why:"La ropa sucia no toca superficies limpias ni el carrito."}
  ]},

{ id:"sh-pertenencias", icon:"🛋️", mins:3,
  t:"Nunca contaminar las pertenencias del residente",
  lead:"El equipo de limpieza nunca va sobre la cama, el sofá, la mesa del comedor ni la encimera del residente.",
  blocks:[
    {k:"rule", tone:"dont", title:"Nunca sobre una superficie limpia del hogar", items:[
      "Paños sucios","Guantes","Cepillos","Botellas de producto","Equipo de limpieza del inodoro","Basura"
    ]},
    {k:"h", text:"Lo del residente no es equipo de limpieza"},
    {k:"rule", tone:"dont", title:"Nunca uses como herramienta", items:[
      "La esponja de cocina del residente","Su paño de platos","Su toalla de manos","Su vaso de cepillos de dientes"
    ]},
    {k:"note", text:"Todo lo que necesitas viene en tu carrito. Si te falta algo, avisa a la oficina — no lo tomes del hogar."}
  ],
  quiz:[
    {q:"¿Dónde puedes apoyar la botella de producto mientras limpias la cocina?", opts:["Sobre la encimera","En el carrito o en el piso sobre un paño de trabajo","Sobre la mesa del comedor"], a:1,
     why:"El equipo de limpieza no va sobre encimeras, mesas, camas ni sofás del residente."},
    {q:"Se te acabaron las esponjas y hay una en el fregadero del residente. ¿La usas?", opts:["Sí, y la enjuago después","No: lo del residente nunca es equipo de limpieza","Solo para el fregadero"], a:1,
     why:"La esponja, los paños y las toallas del residente son suyos. Avisa a la oficina si te falta algo."}
  ]}
  ]},

{ key: "pro", icon: "🤝", label: "Parte 4 · Profesionalismo", blurb: "Cómo nos presentamos, hablamos y respondemos.",
  modules: [
{ id:"pr-cara", icon:"🏢", mins:4,
  t:"Eres la cara de Zing",
  lead:"En Zing no solo limpias apartamentos. Eres la cara de Zing en tu edificio.",
  blocks:[
    {k:"p", text:"Los residentes te verán cada semana. Los administradores te verán. El equipo de mantenimiento te verá. Los residentes confiarán en ti dentro de sus hogares, a veces sin estar presentes. Nuestra meta es ofrecer el profesionalismo y la consistencia que alguien espera de un gran hotel."},
    {k:"say", text:"El profesionalismo crea confianza. La confianza crea clientes recurrentes. Los clientes recurrentes crean trabajo estable a largo plazo."},
    {k:"h", text:"Representas a Zing en todo momento"},
    {k:"check", items:["En el lobby","En el elevador","En el pasillo","En el carrito","Al hablar con la administración","Al hablar con residentes","Incluso cuando crees que nadie te ve"]},
    {k:"p", text:"Tu comportamiento siempre debe comunicar: soy profesional, soy confiable, me importa este edificio, me importa tu hogar."},
    {k:"h", text:"Asume que hay cámaras"},
    {k:"p", text:"Muchos residentes tienen cámaras de seguridad. Puedes verlas o no. Compórtate siempre como si tu trabajo estuviera siendo observado. Pero la razón no es que alguien pueda estar mirando."},
    {k:"say", text:"Nos comportamos exactamente igual cuando alguien nos ve y cuando nadie nos ve. Eso es integridad."}
  ],
  quiz:[
    {q:"¿Dónde representas a Zing?", opts:["Solo dentro del apartamento mientras limpias","En todo el edificio: lobby, elevador, pasillo, carrito","Solo cuando hablas con la administración"], a:1,
     why:"Eres la cara de Zing en tu edificio, no solo mientras limpias."},
    {q:"¿Por qué actuamos como si hubiera cámaras?", opts:["Porque siempre las hay","Porque nos comportamos igual con o sin alguien mirando: eso es integridad","Para evitar multas"], a:1,
     why:"El estándar no depende de si alguien observa. Es el mismo siempre."},
    {q:"¿Qué crea la confianza de un residente?", opts:["Descuentos","Clientes recurrentes y trabajo estable a largo plazo","Menos supervisión"], a:1,
     why:"Un residente que confía vuelve a reservar y recomienda a sus vecinos. El edificio crece y el trabajo se vuelve estable."}
  ]},

{ id:"pr-lista", icon:"👕", mins:4,
  t:"Llega lista: uniforme y presentación",
  lead:"Ser profesional empieza antes de la primera cita. Cuando comienza tu turno, ya estás lista.",
  blocks:[
    {k:"h", text:"Al llegar"},
    {k:"check", items:["Uniforme Zing limpio y sin arrugas visibles","Zapatos limpios y adecuados para el trabajo","Buena higiene personal","Cabello recogido si es largo","Identificación Zing puesta correctamente","Todo el equipo disponible","Teléfono cargado","Suministros listos","Carrito organizado"]},
    {k:"note", text:"No llegues y empieces a prepararte. Debes verte como alguien a quien un residente se siente cómodo dejando entrar a su hogar de inmediato."},
    {k:"h", text:"Uniforme"},
    {k:"p", text:"Tu uniforme comunica profesionalismo antes de que digas una palabra. Nunca trabajes con un uniforme visiblemente sucio o muy arrugado. Si algo lo ensucia durante el día, resuélvelo tan pronto como sea razonablemente posible."},
    {k:"h", text:"Presentación personal"},
    {k:"rule", tone:"do", title:"Siempre", items:["Cabello limpio y ordenado; si es largo, bien amarrado (evita que caiga en superficies o se enrede en el equipo)","Uñas limpias y prácticas para limpiar","Higiene personal diaria"]},
    {k:"rule", tone:"dont", title:"Evita", items:["Perfume en exceso o productos con olor fuerte: los residentes pueden tener alergias o sensibilidad"]}
  ],
  quiz:[
    {q:"¿Cuándo debes estar lista para trabajar?", opts:["Cuando comienza el turno, ya lista","Durante los primeros 15 minutos del turno","Antes de la primera cita, mientras preparo el carrito"], a:0,
     why:"No llegas a prepararte: llegas preparada."},
    {q:"¿Por qué el cabello largo va recogido?", opts:["Por estética","Para que no caiga en superficies ni se enrede en el equipo","Solo si el residente lo pide"], a:1,
     why:"Un cabello en el piso es una de las quejas más comunes, y el cabello suelto es un riesgo con el equipo."},
    {q:"¿Perfume fuerte antes del turno?", opts:["Sí, comunica limpieza","No: los residentes pueden tener alergias o sensibilidad","Solo en invierno"], a:1,
     why:"Evita perfumes y productos con olor fuerte dentro del hogar de otra persona."}
  ]},

{ id:"pr-dentro", icon:"📵", mins:4,
  t:"Dentro del hogar: sin chicle, sin comida, sin teléfono",
  lead:"Un residente nunca debe preguntarse si te está pagando por mirar tu teléfono.",
  blocks:[
    {k:"h", text:"Chicle, comida y bebidas"},
    {k:"rule", tone:"dont", title:"Nunca", items:["Masticar chicle mientras trabajas o hablas con residentes","Comer dentro del apartamento de un residente","Entrar con una comida abierta"]},
    {k:"p", text:"Puedes llevar agua según los procedimientos de Zing, guardada apropiadamente y nunca sobre los muebles, encimeras o pertenencias del residente. Los descansos y comidas son en áreas designadas, no dentro de los hogares."},
    {k:"h", text:"El teléfono se guarda"},
    {k:"p", text:"Tu teléfono es una herramienta de trabajo cuando lo necesitas para Zing. No es entretenimiento mientras trabajas."},
    {k:"rule", tone:"dont", title:"Dentro del hogar, nunca", items:["Llamadas personales","FaceTime","Redes sociales","Mensajes a amigos","Videos","Audífonos o auriculares"]},
    {k:"p", text:"Si lo necesitas para la app de Zing, la agenda, comunicarte con el equipo o documentar un problema aprobado, úsalo y guárdalo. Si hay una emergencia personal, sal del apartamento cuando sea posible."},
    {k:"h", text:"Los hábitos personales quedan fuera del trabajo"},
    {k:"rule", tone:"dont", title:"Nunca", items:["Fumar o vapear dentro de apartamentos o representando a Zing en lugares inapropiados","Alcohol o drogas antes o durante el trabajo","Lenguaje inapropiado","Música ofensiva","Conversaciones inapropiadas"]},
    {k:"say", text:"Cuando te pones el uniforme Zing, representas a la compañía."}
  ],
  quiz:[
    {q:"¿Puedes usar audífonos mientras limpias un apartamento?", opts:["Sí, si el residente no está","No: nunca dentro del hogar de un residente","Solo con un audífono"], a:1,
     why:"Nada de audífonos, videos, redes ni llamadas personales dentro del hogar."},
    {q:"Necesitas revisar la app de Zing. ¿Qué haces?", opts:["La reviso y guardo el teléfono","Espero al final del turno","Le pido al residente permiso"], a:0,
     why:"El teléfono es herramienta de trabajo: úsalo para Zing y guárdalo."},
    {q:"¿Dónde puedes dejar tu botella de agua?", opts:["En la encimera de la cocina","En la mesa de noche","Guardada según el procedimiento, nunca sobre pertenencias del residente"], a:2,
     why:"El agua se lleva según el procedimiento y nunca va sobre muebles ni encimeras del residente."}
  ]},

{ id:"pr-saluda", icon:"👋", mins:3,
  t:"Saluda a todos. Habla bajo. Cuida las áreas comunes.",
  lead:"Trabajas en un mismo edificio una y otra vez. Eres parte de su día a día.",
  blocks:[
    {k:"h", text:"Saluda"},
    {k:"say", text:"\u201CBuenos días.\u201D \u201CBuenas tardes.\u201D \u201CHola.\u201D"},
    {k:"p", text:"Reconoce a las personas. Sonríe. Sostén el elevador cuando corresponda. Sé cortés con recepción, mantenimiento, administración, repartidores y residentes. No necesitas conversaciones largas."},
    {k:"say", text:"Amable. Cálida. Breve. Profesional."},
    {k:"h", text:"Habla bajo"},
    {k:"p", text:"Los edificios son hogares. Usa una voz calmada y baja. Nunca grites por los pasillos, nunca pongas música alta, nunca hables fuerte por teléfono ni de un cuarto a otro. Si dos personas de Zing trabajan juntas, hablen en voz baja."},
    {k:"h", text:"Pasillos, elevadores y áreas comunes"},
    {k:"rule", tone:"dont", title:"Nunca", items:["Bloquear un pasillo sin necesidad","Dejar suministros en el piso","Dejar basura afuera de los apartamentos","Hacer ruido excesivo"]},
    {k:"rule", tone:"do", title:"Siempre", items:["Carrito bien posicionado","Consideración al entrar al elevador con equipo","Espacio para que los residentes pasen","Si ensucias o derramas algo en un área común, resuélvelo de inmediato o avisa a quien corresponda"]},
    {k:"say", text:"Deja el edificio mejor de como lo encontraste."}
  ],
  quiz:[
    {q:"¿Cómo debe ser una interacción en el pasillo?", opts:["Larga y detallada","Amable, cálida, breve y profesional","Evitar el contacto visual"], a:1,
     why:"Reconocer, saludar y seguir. No necesitas conversaciones largas."},
    {q:"Derramaste agua en el pasillo. ¿Qué haces?", opts:["Sigo, mantenimiento lo verá","Lo resuelvo de inmediato o aviso a quien corresponda","Lo limpio al final del turno"], a:1,
     why:"Lo que ensuciamos en un área común lo resolvemos ya."},
    {q:"Tu compañera está en otro cuarto. ¿Cómo le hablas?", opts:["Le grito desde donde estoy","Voy hasta donde está y hablo bajo","Le mando un audio con volumen alto"], a:1,
     why:"Nunca gritamos de un cuarto a otro. El edificio es el hogar de otras personas."}
  ]},

{ id:"pr-ocupado", icon:"🚪", mins:4,
  t:"Un hogar con el residente presente",
  lead:"Estás entrando a su espacio privado. Mientras estamos ahí, somos invitados.",
  blocks:[
    {k:"h", text:"Al entrar"},
    {k:"p", text:"Saluda con calidez. Confirma por qué estás ahí. Antes de entrar a un cuarto donde está el residente, anúnciate o pide permiso cuando corresponda."},
    {k:"say", text:"\u201C¿Puedo pasar?\u201D · \u201C¿Está bien si empiezo por la habitación?\u201D · \u201CYa terminé aquí. ¿Sigo con el baño?\u201D"},
    {k:"note", text:"Nunca hagas sentir a un residente que tomaste el control de su hogar."},
    {k:"h", text:"Conversaciones"},
    {k:"p", text:"Sé cálida sin ser invasiva. Los residentes pueden querer conversar. Sé amable, pero recuerda que estás trabajando."},
    {k:"rule", tone:"dont", title:"Evita hablar de", items:["Política","Religión","Otros residentes","Chismes del edificio","Problemas personales","Dinero","Temas controversiales"]},
    {k:"p", text:"Nunca hagas preguntas invasivas sobre la vida personal de alguien. Regla: cálida, amable, breve, profesional."},
    {k:"h", text:"Si necesitas mover algo importante"},
    {k:"say", text:"\u201C¿Le molesta si muevo esto?\u201D"},
    {k:"p", text:"Si el residente no está y no sabes si algo debe moverse, déjalo donde está y contacta a Zing si es necesario. Nunca tomes riesgos innecesarios con las posesiones de alguien."},
    {k:"h", text:"Pedidos del residente"},
    {k:"p", text:"\u201C¿Puedes hacer esto también?\u201D No digas sí automáticamente. No digas no automáticamente. Verifica si está incluido en el servicio reservado o si se puede agregar a través de Zing."},
    {k:"say", text:"\u201CDéjeme verificarlo.\u201D"},
    {k:"rule", tone:"dont", title:"Nunca", items:["Negociar en privado trabajo adicional, precios, propinas, limpiezas futuras o servicios fuera de Zing"]}
  ],
  quiz:[
    {q:"El residente está en la sala y tú vas a empezar por la habitación. ¿Qué haces?", opts:["Entro directo, para eso me contrataron","Pregunto: \u201C¿Está bien si empiezo por la habitación?\u201D","Espero a que se vaya"], a:1,
     why:"Anunciarte o pedir permiso: somos invitadas en su hogar."},
    {q:"Un residente te pide algo que no está en el servicio. ¿Qué respondes?", opts:["\u201CClaro, sin problema\u201D","\u201CNo, eso no lo hago\u201D","\u201CDéjeme verificarlo\u201D y sigo el procedimiento de Zing"], a:2,
     why:"Ni sí ni no automático. Se verifica y se agrega a través de Zing si aplica."},
    {q:"El residente te ofrece pagarte aparte por limpiar el balcón cada semana. ¿Qué haces?", opts:["Acepto, es trabajo extra","No: nunca negocio servicios ni pagos fuera de Zing","Acepto solo si es en efectivo"], a:1,
     why:"Todo servicio, precio o propina pasa por Zing. Nunca se negocia en privado."}
  ]},

{ id:"pr-privacidad", icon:"🔒", mins:4,
  t:"La privacidad es sagrada",
  lead:"Los residentes confían a Zing el acceso a sus hogares. Lo que ves en un hogar se queda en el hogar.",
  blocks:[
    {k:"h", text:"No abras nada que tu tarea no requiera"},
    {k:"rule", tone:"dont", title:"No mires dentro de", items:["Cajones","Botiquines","Closets","Cajas","Bolsas","Escritorios","Papeles personales","Computadoras","Recipientes personales"]},
    {k:"p", text:"Si te piden organizar un closet, puedes acceder a ese closet. Limpiar el espejo del baño no te da permiso de explorar el botiquín detrás de él."},
    {k:"say", text:"Si no sabes si debes abrir algo: no lo abras. Pregunta."},
    {k:"h", text:"Lo que ves se queda ahí"},
    {k:"p", text:"Puedes ver medicamentos, documentos, dinero, fotos familiares, relaciones, objetos religiosos, pertenencias costosas, hábitos personales, cosas que te parezcan raras. Nada de eso es asunto tuyo."},
    {k:"rule", tone:"dont", title:"Nunca", items:["Fotografiarlo","Contárselo a otro residente","Contárselo a amigos","Chismear sobre residentes con compañeras","Publicar algo del apartamento en redes sociales"]},
    {k:"note", text:"Una profesional de Zing puede trabajar años en el hogar de alguien sin revelar nunca nada de lo que pasa adentro."},
    {k:"h", text:"Acceso y otras personas"},
    {k:"rule", tone:"dont", title:"Nunca", items:["Compartir un código de acceso","Prestar una llave o un fob","Dejar llaves sin supervisión","Etiquetar algo de forma que identifique el apartamento de un residente","Dejar entrar a alguien porque dice conocer al residente","Traer a un amigo, familiar, niño, pareja o cualquier otra persona al apartamento o al área de trabajo"]},
    {k:"say", text:"La conveniencia nunca está por encima de la seguridad."}
  ],
  quiz:[
    {q:"Limpias el espejo del baño. ¿Puedes abrir el botiquín para limpiarlo por dentro?", opts:["Sí, es parte del baño","No: limpiar el espejo no da permiso de abrir el botiquín","Solo si está entreabierto"], a:1,
     why:"Solo se abre lo que la tarea requiere. Si dudas, pregunta."},
    {q:"Ves algo muy costoso en un apartamento. ¿Qué haces?", opts:["Le tomo una foto para mostrar","Se lo comento a una compañera","Nada: lo que ves en un hogar se queda en el hogar"], a:2,
     why:"Nunca se fotografía, se comenta ni se publica nada de un hogar."},
    {q:"Alguien en el pasillo dice ser el primo del residente y pide que lo dejes entrar. ¿Qué haces?", opts:["Lo dejo entrar si parece confiable","No lo dejo entrar y sigo el procedimiento de acceso de Zing","Le pido una identificación y lo dejo entrar"], a:1,
     why:"Nunca dejamos entrar a nadie por decir que conoce al residente. La conveniencia no supera la seguridad."}
  ]},

{ id:"pr-nunca", icon:"🤐", mins:3,
  t:"Nunca discutas. Nunca te quejes. Nunca juzgues.",
  lead:"Los residentes siempre deben ver un solo equipo Zing profesional.",
  blocks:[
    {k:"h", text:"Nunca discutas frente a un residente"},
    {k:"p", text:"Esto es absoluto. Si no estás de acuerdo con otra persona de Zing, una supervisora, alguien del edificio o quien sea: no discutas frente a un residente, no se corrijan con agresividad, no te quejes de otra empleada, no culpes a nadie, no hables de problemas internos de Zing, de agenda, de administración ni conflictos personales."},
    {k:"say", text:"Termina la interacción con profesionalismo y resuélvelo en privado después."},
    {k:"h", text:"Nunca te quejes con residentes"},
    {k:"rule", tone:"dont", title:"Nunca te quejes de", items:["Otra limpiadora","Tu horario","Zing","La administración del edificio","Otro residente","Qué tan sucio está un apartamento","Qué tan difícil es una tarea","Tu pago","Qué tan ocupada estás","Algo que hizo la compañía"]},
    {k:"p", text:"Si tienes un problema, tráelo a Zing. Queremos escucharlo. Pero el residente nunca debe quedar en medio de un asunto interno."},
    {k:"h", text:"Nunca juzgues un hogar"},
    {k:"p", text:"Algunos apartamentos estarán muy limpios. Otros, desordenados. Platos por todos lados, ropa acumulada, un baño muy sucio. Nunca reacciones: sin caras, sin comentarios, sin bromas. Nunca digas \u201CGuau, esto está muy sucio.\u201D"},
    {k:"say", text:"Todos merecen un poco de ayuda en casa. Estamos ahí para ayudar, no para juzgar."}
  ],
  quiz:[
    {q:"Tu compañera cometió un error frente al residente. ¿Qué haces?", opts:["La corrijo ahí mismo para que el residente vea que lo notamos","Termino la interacción con profesionalismo y lo hablamos en privado después","Le explico al residente que no fue mi culpa"], a:1,
     why:"Nunca se discute ni se corrige con agresividad frente a un residente."},
    {q:"El residente pregunta si te gusta tu horario y no te gusta. ¿Qué respondes?", opts:["Le cuento el problema","Respondo con amabilidad y breve; el problema lo llevo a Zing","Me quejo de la administración"], a:1,
     why:"Las quejas van a Zing, nunca al residente."},
    {q:"Entras y el apartamento está muy sucio. ¿Qué haces?", opts:["Hago un comentario en broma para relajar","Nada: sin caras, sin comentarios. Estamos para ayudar","Le digo que va a tomar más tiempo por lo sucio"], a:1,
     why:"Nunca juzgamos un hogar. Todos merecen un poco de ayuda en casa."}
  ]},

{ id:"pr-rompe", icon:"🗣️", mins:3,
  t:"Si algo se rompe, dilo. Cuando no sepas, pregunta.",
  lead:"La confianza es más importante que evitar una conversación incómoda.",
  blocks:[
    {k:"h", text:"Si dañas o rompes algo"},
    {k:"check", items:["Para","Documenta si se requiere","Contacta a Zing de inmediato","Sigue las instrucciones"]},
    {k:"rule", tone:"dont", title:"Nunca", items:["Intentar esconder un daño","Volver a colocar algo esperando que el residente no lo note"]},
    {k:"h", text:"Cuando no sepas, pregunta"},
    {k:"p", text:"Ser independiente no significa inventar todo tú misma. Las personas profesionales saben cuándo pedir ayuda."},
    {k:"rule", tone:"do", title:"Para y pregunta a Zing si no estás segura sobre", items:["Un pedido del residente","Un producto de limpieza","Una superficie delicada","Acceso","Algo valioso","Una situación de seguridad","Un daño","Un problema de agenda","Una situación inusual"]},
    {k:"say", text:"Preferimos responder una pregunta que arreglar un error evitable."}
  ],
  quiz:[
    {q:"Se te cayó un adorno y se quebró un poco. Puedes ponerlo de forma que no se note. ¿Qué haces?", opts:["Lo acomodo para que no se note","Paro, documento y contacto a Zing de inmediato","Lo tiro a la basura"], a:1,
     why:"Nunca se esconde un daño. La confianza vale más que una conversación incómoda."},
    {q:"No sabes si un producto es seguro para una superficie de mármol. ¿Qué haces?", opts:["Pruebo en una esquina","Paro y pregunto a Zing","Uso agua y espero que sirva"], a:1,
     why:"Ante la duda sobre un producto o una superficie delicada, se pregunta."}
  ]},

{ id:"pr-carrito", icon:"🛒", mins:3,
  t:"El carrito y el equipo te representan",
  lead:"Un carrito desordenado comunica una operación desordenada.",
  blocks:[
    {k:"p", text:"Tu carrito es visible en el edificio y es parte de la experiencia Zing. Debe verse tan profesional como para pertenecer a un gran hotel."},
    {k:"h", text:"Cada día"},
    {k:"check", items:["Carrito limpio","Suministros organizados","Botellas limpias y bien etiquetadas","Paños organizados","Aspiradora limpia","Sin basura","Sin bolsas sueltas","Sin comida","Sin pertenencias personales visibles","Nada apilado con descuido"]},
    {k:"note", text:"Un residente debe pasar junto al carrito y entender de inmediato que hay un equipo profesional de housekeeping trabajando en su piso."},
    {k:"h", text:"Cuida tu equipo"},
    {k:"rule", tone:"dont", title:"Nunca", items:["Lanzar el equipo","Dejarlo sucio sin necesidad","Forzar algo que no funciona bien"]},
    {k:"rule", tone:"do", title:"Siempre", items:["Limpiar el equipo después de usarlo","Devolver todo a su lugar asignado","Reportar daños de inmediato"]}
  ],
  quiz:[
    {q:"¿Qué comunica un carrito desordenado?", opts:["Que hubo mucho trabajo","Una operación desordenada","Nada, es solo un carrito"], a:1,
     why:"El carrito es visible y es parte de la experiencia. Debe verse de hotel."},
    {q:"La aspiradora hace un ruido extraño. ¿Qué haces?", opts:["La fuerzo hasta terminar el turno","Dejo de usarla y reporto el daño de inmediato","La guardo sin decir nada"], a:1,
     why:"Nunca se fuerza el equipo. Se reporta de inmediato."},
    {q:"¿Puede ir tu bolso personal a la vista sobre el carrito?", opts:["Sí, si está ordenado","No: sin pertenencias personales visibles","Solo en el piso bajo"], a:1,
     why:"Sin comida, sin bolsas sueltas, sin pertenencias personales visibles."}
  ]},

{ id:"pr-edificio", icon:"🏆", mins:4,
  t:"Tu edificio es tu responsabilidad",
  lead:"No pienses \u201Cvine a completar las limpiezas de hoy\u201D. Piensa \u201Csoy responsable de que Zing tenga éxito en este edificio\u201D.",
  blocks:[
    {k:"h", text:"Independencia con responsabilidad"},
    {k:"p", text:"Zing da a su equipo mucha independencia. Con la independencia viene la responsabilidad: tú te aseguras de tener lo que necesitas para operar tu edificio. No esperes a que algo se acabe por completo."},
    {k:"check", items:["Revisa suministros con regularidad","Cubrezapatos bajos → pídelos","Producto bajo → pídelo","Paños para reemplazar → repórtalo","Equipo que no funciona → repórtalo","Algo del carrito por reparar → repórtalo","Un problema recurrente → cuéntanos"]},
    {k:"note", text:"Quedarse sin un suministro básico durante una cita debe ser extremadamente raro, porque planificamos con anticipación."},
    {k:"h", text:"Termina como un hotel"},
    {k:"p", text:"Antes de salir de un apartamento, detente y mira alrededor. Revisa tu trabajo, guarda el equipo, asegúrate de no dejar nada y de que el espacio se vea intencional. No dejes que los últimos cinco minutos deshagan el profesionalismo de la hora anterior."},
    {k:"say", text:"\u201CSi esto fuera la habitación de un gran hotel, ¿estaría orgullosa de presentarla así?\u201D"},
    {k:"h", text:"Sé dueña de tu edificio"},
    {k:"check", items:["Conoce a tus residentes","Cuida tu carrito","Mantén tus suministros","Construye una buena relación con la administración","Ten orgullo de los pasillos donde te ven","Nota los problemas y comunícalos","Protege la confianza de los residentes","Entrega trabajo consistente"]},
    {k:"h", text:"El profesionalismo construye tu futuro"},
    {k:"p", text:"Cada residente que reserva una vez decide: ¿vuelvo a reservar Zing? Su decisión no depende solo de si el baño quedó limpio. Depende de toda la experiencia: ¿confió en ti? ¿fuiste puntual? ¿te veías profesional? ¿fuiste amable? ¿respetaste su hogar? ¿le hiciste la vida más fácil? ¿te daría acceso sin estar en casa?"},
    {k:"p", text:"Cuando la respuesta es sí, vuelve a reservar. Le cuenta a sus vecinos. Más residentes usan Zing. El edificio crece. La administración ve que los residentes aman el servicio. Zing se queda en el edificio. Y el edificio da trabajo consistente por años."},
    {k:"say", text:"EL PROFESIONALISMO ES EL TRABAJO. Limpiar es lo que hacemos. La confianza es lo que hace que los residentes nos inviten de vuelta."}
  ],
  quiz:[
    {q:"Te quedan pocos cubrezapatos, pero alcanzan para hoy. ¿Qué haces?", opts:["Los pido hoy: no espero a que se acaben","Los pido cuando se acaben","Uso los del residente"], a:0,
     why:"Planificamos con anticipación. Quedarse sin un suministro básico debe ser extremadamente raro."},
    {q:"¿Qué te preguntas antes de salir de un apartamento?", opts:["\u201C¿Ya es hora de la siguiente cita?\u201D","\u201CSi esto fuera un gran hotel, ¿estaría orgullosa de presentarlo así?\u201D","\u201C¿El residente notará lo que falta?\u201D"], a:1,
     why:"Los últimos cinco minutos no pueden deshacer el profesionalismo de la hora anterior."},
    {q:"¿De qué depende que un residente vuelva a reservar?", opts:["Solo de si el baño quedó limpio","De toda la experiencia: confianza, puntualidad, presentación, respeto","Del precio"], a:1,
     why:"Limpiar es lo que hacemos. La confianza es lo que hace que nos inviten de vuelta."}
  ]}
  ]},
{ key: "grow", icon: "🌱", label: "Parte 5 · Hacer Crecer tu Edificio", blurb: "Cómo promover Zing dentro de tu edificio. Crecerlo es tu responsabilidad.",
  modules: [
{ id:"gr-staff", icon:"🤝", mins:4,
  t:"Gánate al equipo del edificio",
  lead:"Crecer tu edificio es tu responsabilidad. Y empieza con la gente que trabaja ahí todos los días, no con los residentes.",
  blocks:[
    {k:"p", text:"En cada edificio hay un equipo que lo hace funcionar: la administración, la recepción, mantenimiento, seguridad, quienes limpian las áreas comunes, los porteros y valet. Ellos ven quién entra y sale, escuchan a los residentes y deciden si la vida te será fácil o difícil."},
    {k:"say", text:"Cuando el equipo del edificio te aprecia, el edificio crece. Cuando no, todo se traba."},
    {k:"h", text:"Cómo ganarte su confianza"},
    {k:"check", items:[
      "Aprende sus nombres y úsalos al saludar",
      "Saluda todos los días, aunque estés apurada",
      "Nunca les des trabajo extra: sin basura, sin desorden, sin carrito bloqueando",
      "Si te piden algo razonable, hazlo con buena actitud",
      "Agradece: quien te abre una puerta o te avisa algo merece un gracias",
      "Nunca hables mal de la administración ni de un residente con ellos"
    ]},
    {k:"h", text:"Ellos también son tu red"},
    {k:"p", text:"Un recepcionista que confía en ti recomienda Zing cuando un residente pregunta por limpieza. Un administrador que te aprecia defiende a Zing en el edificio. Mantenimiento que te respeta te avisa cuando algo cambia. Cada relación es una puerta que se abre."},
    {k:"note", text:"Los residentes que limpian las áreas comunes son compañeros, no competencia. Trátalos con el mismo respeto que a la administración."}
  ],
  quiz:[
    {q:"¿Con quién empieza el crecimiento de tu edificio?", opts:["Con los residentes que reservan","Con el equipo que trabaja en el edificio: administración, recepción, mantenimiento","Con la oficina de Zing"], a:1,
     why:"Ellos ven todo, escuchan a los residentes y deciden si tu día es fácil o difícil. Su confianza abre puertas."},
    {q:"El recepcionista te pide mover el carrito porque estorba en la entrada. ¿Qué haces?", opts:["Le explico que estoy trabajando y lo dejo","Lo muevo con buena actitud y le agradezco el aviso","Lo muevo, pero me quejo con la oficina"], a:1,
     why:"Nunca les des trabajo extra. Un pedido razonable se cumple con buena actitud."},
    {q:"¿De quién es la responsabilidad de que Zing crezca en tu edificio?", opts:["De la oficina de Zing","De la administración del edificio","Mía: es mi edificio"], a:2,
     why:"Zing te da independencia. Con ella viene la responsabilidad de hacer crecer tu edificio."}
  ]},

{ id:"gr-reglas", icon:"📋", mins:4,
  t:"Cada edificio tiene sus reglas. Apréndelas y síguelas.",
  lead:"Dónde se guarda el carrito, cómo se accede a las unidades, dónde puedes tomar un descanso. Nada de esto es igual entre edificios.",
  blocks:[
    {k:"p", text:"Un edificio te da un cuarto para el carrito; otro te pide dejarlo en un área de servicio. Uno te entrega llaves en recepción; otro usa códigos o un fob. Uno tiene un cuarto de descanso para proveedores; otro espera que salgas a la calle. Aprender esas reglas en tus primeros días es parte del trabajo."},
    {k:"h", text:"Lo que debes saber de tu edificio"},
    {k:"check", items:[
      "Dónde se guarda el carrito y a qué hora debe estar guardado",
      "Cómo se accede a cada unidad: llaves, códigos, fob, recepción",
      "Qué elevador usas con el carrito (servicio o residentes)",
      "Dónde se saca la basura y a qué hora",
      "Dónde puedes tomar un descanso o almorzar",
      "Dónde puedes usar el baño",
      "A quién avisas si algo cambia o algo falla"
    ]},
    {k:"say", text:"Si no sabes una regla, pregunta el primer día. Nunca la adivines."},
    {k:"h", text:"Seguir las reglas es respeto"},
    {k:"p", text:"Cada vez que sigues una regla del edificio sin que te la repitan, el equipo del edificio nota que se puede confiar en ti. Cada vez que la rompes —aunque sea pequeña— te conviertes en un problema que alguien tiene que administrar."},
    {k:"rule", tone:"dont", title:"Nunca", items:[
      "Dejar el carrito donde no está permitido “solo un momento”",
      "Usar el elevador de residentes con el carrito si el edificio lo prohíbe",
      "Comer o descansar en áreas comunes de residentes si no está permitido",
      "Pedirle a un residente que te abra una puerta que no te corresponde"
    ]},
    {k:"note", text:"Cuanto más confíen en ti las personas que trabajan en el edificio, mejor irá todo: acceso, horarios, recomendaciones y permisos para promover Zing."}
  ],
  quiz:[
    {q:"Llegas a un edificio nuevo y no sabes dónde guardar el carrito. ¿Qué haces?", opts:["Lo dejo en el pasillo del primer piso mientras averiguo","Pregunto en recepción o a la administración el primer día","Lo llevo a mi carro"], a:1,
     why:"Las reglas se preguntan, nunca se adivinan."},
    {q:"El edificio pide usar el elevador de servicio con el carrito, pero el de residentes está más cerca. ¿Cuál usas?", opts:["El de residentes, si no hay nadie","El de servicio, siempre","El que llegue primero"], a:1,
     why:"Seguir las reglas del edificio sin que te las repitan es lo que construye confianza."},
    {q:"¿Por qué importa dónde tomas tu descanso?", opts:["No importa, es mi tiempo","Porque cada regla que sigues sin que te la repitan demuestra que se puede confiar en ti","Solo importa si la administración está presente"], a:1,
     why:"Romper una regla pequeña te convierte en un problema que alguien tiene que administrar."}
  ]},

{ id:"gr-tarjeta", icon:"💌", mins:4,
  t:"“Somos el housekeeping del edificio.”",
  lead:"Zing te da postales y volantes. Tu trabajo es ponerlos en manos de los residentes, con una sonrisa y una sola frase.",
  blocks:[
    {k:"h", text:"El mensaje central"},
    {k:"say", text:"\u201CHola, somos el housekeeping del edificio. Estamos aquí todos los días.\u201D"},
    {k:"p", text:"Esa frase lo dice todo: no somos una empresa que viene de afuera, somos parte del edificio. Estamos aquí todos los días. Repítela siempre igual, en el elevador, en el lobby y en el piso."},
    {k:"h", text:"Dónde y cuándo"},
    {k:"check", items:[
      "En el elevador: saluda, sonríe y ofrece una tarjeta",
      "En el lobby: cuando un residente entra o sale",
      "En el piso: cuando alguien pasa junto al carrito",
      "Siempre que un residente te pregunte qué haces ahí"
    ]},
    {k:"h", text:"Cómo ofrecerla"},
    {k:"say", text:"\u201CBuenos días. Somos el housekeeping del edificio, estamos aquí todos los días. ¿Le puedo dejar una tarjeta?\u201D"},
    {k:"rule", tone:"do", title:"Siempre", items:[
      "Con una sonrisa y voz calmada",
      "Breve: una frase y la tarjeta",
      "Si dicen que no, agradece y sigue",
      "Lleva tarjetas siempre contigo y en el carrito"
    ]},
    {k:"rule", tone:"dont", title:"Nunca", items:[
      "Insistir si alguien no quiere",
      "Interrumpir una llamada o conversación",
      "Hablar de precios o prometer descuentos: eso lo hace la app y la oficina",
      "Dejar volantes bajo las puertas sin autorización del edificio"
    ]},
    {k:"note", text:"Si te quedan pocas tarjetas o volantes, pídelos a la oficina antes de que se acaben. Nunca deberías estar en el edificio sin material."}
  ],
  quiz:[
    {q:"¿Cuál es el mensaje central al ofrecer una tarjeta?", opts:["\u201CTenemos los mejores precios\u201D","\u201CSomos el housekeeping del edificio. Estamos aquí todos los días.\u201D","\u201CSomos una empresa de limpieza de Miami\u201D"], a:1,
     why:"Somos parte del edificio y estamos todos los días. Esa es la diferencia con cualquier otra empresa."},
    {q:"Un residente en el elevador dice \u201Cno, gracias\u201D. ¿Qué haces?", opts:["Le explico los beneficios rápido","Agradezco con una sonrisa y sigo","Le dejo la tarjeta de todas formas"], a:1,
     why:"Breve y educada, siempre. Insistir daña la confianza que estás construyendo."},
    {q:"Un residente pregunta cuánto cuesta. ¿Qué respondes?", opts:["Le doy un precio aproximado","Le prometo un descuento si reserva hoy","Le entrego la tarjeta y le digo que los precios están en la app"], a:2,
     why:"Los precios y promociones los maneja la app y la oficina, nunca se negocian en el pasillo."}
  ]},

{ id:"gr-carrito", icon:"🛒", mins:3,
  t:"Un carrito visible vende. Un carrito guardado no.",
  lead:"Cada residente que ve el carrito en su piso entiende que hay housekeeping en el edificio. Un carrito en un closet no le dice nada a nadie.",
  blocks:[
    {k:"p", text:"El carrito es tu mejor anuncio. Es limpio, tiene el logo, tiene las tarjetas y se ve de hotel. Cuando está a la vista, genera preguntas, conversaciones y reservas. Cuando está guardado, el edificio no sabe que existes."},
    {k:"say", text:"Ver el carrito trae clientes."},
    {k:"h", text:"La táctica del hueco entre reservas"},
    {k:"p", text:"Si no tienes una reserva en un horario, no escondas el carrito. Déjalo en un piso, en el pasillo entre dos puertas de apartamentos, ordenado y con las tarjetas a la vista. Parece que estás trabajando dentro de una unidad, y cada vecino que pasa lo ve."},
    {k:"check", items:[
      "Elige pisos distintos en días distintos para que te vea todo el edificio",
      "Carrito impecable: es un anuncio, tiene que verse de hotel",
      "Tarjetas al frente, fáciles de tomar",
      "Nunca bloquea el pasillo ni una puerta",
      "Mantente cerca: si alguien pregunta, respondes con la frase central"
    ]},
    {k:"rule", tone:"dont", title:"Nunca", items:[
      "Dejar el carrito donde el edificio lo prohíbe: sigue las reglas de la Parte 5, lección 2",
      "Dejarlo desordenado o con basura a la vista",
      "Dejarlo sin supervisión por mucho tiempo si el edificio lo pide"
    ]},
    {k:"note", text:"Repasa la lección \u201CEl carrito y el equipo te representan\u201D en Parte 4. Un carrito visible solo ayuda si está impecable."}
  ],
  quiz:[
    {q:"No tienes reserva en la próxima hora. ¿Dónde va el carrito?", opts:["Guardado en el cuarto de servicio","En un pasillo, entre dos puertas de apartamentos, ordenado y con tarjetas a la vista","En el lobby, junto a la recepción"], a:1,
     why:"Un carrito visible en un piso parece trabajo en curso y cada vecino que pasa lo ve."},
    {q:"¿Por qué un carrito guardado no ayuda a crecer el edificio?", opts:["Porque se ensucia","Porque nadie lo ve: no anuncia el servicio","Sí ayuda, porque está seguro"], a:1,
     why:"Ver el carrito trae clientes. Un carrito en un closet no le dice nada a nadie."},
    {q:"¿Qué debe tener el carrito cuando está a la vista?", opts:["Solo el logo","Impecable, tarjetas al frente y sin bloquear pasillos ni puertas","Un letrero con precios"], a:1,
     why:"Es un anuncio: tiene que verse de hotel, tener tarjetas y respetar el paso."}
  ]},

{ id:"gr-chat", icon:"💬", mins:3,
  t:"El chat del edificio: pide una mención",
  lead:"Casi todos los edificios tienen un chat de residentes en WhatsApp u otra app. Una recomendación ahí vale más que cien volantes.",
  blocks:[
    {k:"p", text:"Los residentes confían en sus vecinos. Cuando alguien escribe en el chat del edificio \u201Cyo uso a Zing, son excelentes\u201D, decenas de personas lo leen y varias reservan. Tú no puedes entrar a ese chat, pero tus clientes sí."},
    {k:"h", text:"Cuándo pedirlo"},
    {k:"p", text:"Solo cuando ya construiste confianza. Un residente recurrente, que te conoce, que te ha dicho que está contento con el servicio. Nunca en la primera visita, nunca a alguien que no está satisfecho."},
    {k:"h", text:"Cómo pedirlo"},
    {k:"say", text:"\u201CMe alegra mucho que esté contento. Si algún día tiene un momento, ¿le molestaría mencionarnos en el chat del edificio? Nos ayuda muchísimo.\u201D"},
    {k:"rule", tone:"do", title:"Siempre", items:[
      "Con humildad y sin presión: es un favor, no una condición",
      "Una sola vez: si dice que sí y no lo hace, no lo vuelvas a pedir",
      "Agradece de verdad si lo hace",
      "Avisa a la oficina: queremos saber quién nos recomendó"
    ]},
    {k:"rule", tone:"dont", title:"Nunca", items:[
      "Pedirlo a cambio de algo: descuentos, tareas extra, propinas",
      "Pedirle al residente que te agregue al chat",
      "Escribir tú el mensaje y pedir que lo copie"
    ]},
    {k:"note", text:"Una mención en el chat, un carrito visible, tarjetas en el elevador y un equipo del edificio que te aprecia. Así crece tu edificio, y así crece tu trabajo."}
  ],
  quiz:[
    {q:"¿A quién le pides una mención en el chat del edificio?", opts:["A cualquier residente que reserve","A un residente recurrente que confía en ti y está contento","A la administración"], a:1,
     why:"Solo cuando ya hay confianza. Nunca en la primera visita ni a alguien insatisfecho."},
    {q:"Un residente contento dice que lo hará, pero pasan semanas y no lo hace. ¿Qué haces?", opts:["Se lo recuerdo en cada visita","No lo vuelvo a pedir: fue un favor, no una condición","Le ofrezco un descuento si lo hace"], a:1,
     why:"Se pide una vez, con humildad. Insistir o pagar por una recomendación daña la confianza."},
    {q:"¿Por qué una mención en el chat vale tanto?", opts:["Porque es gratis","Porque los residentes confían en sus vecinos más que en cualquier volante","Porque la administración la ve"], a:1,
     why:"Una recomendación de un vecino la leen decenas de personas y varias reservan."}
  ]},

{ id:"gr-magia", icon:"✨", mins:3,
  t:"Pequeños momentos de magia",
  lead:"Un detalle pequeño que el residente nota al volver a casa hace que hable de Zing. Y cuando hablan, llegan referidos.",
  blocks:[
    {k:"p", text:"Un baño limpio es lo que el residente pagó. No sorprende a nadie. Lo que sorprende es lo que no esperaba: un chocolate sobre la almohada, el papel higiénico doblado en punta, las toallas acomodadas como en un hotel, los zapatos alineados junto a la puerta."},
    {k:"say", text:"Tres minutos de magia Zing al final de cada visita."},
    {k:"h", text:"Ideas de magia Zing"},
    {k:"check", items:[
      "Un chocolate Zing sobre la almohada o la encimera",
      "Papel higiénico doblado en punta",
      "Toallas dobladas y acomodadas como en un hotel",
      "Cojines del sofá acomodados y esponjados",
      "Zapatos alineados junto a la puerta",
      "Control remoto y objetos pequeños alineados sobre la mesa"
    ]},
    {k:"h", text:"Por qué funciona"},
    {k:"p", text:"El residente llega, ve el detalle y sonríe. Le toma una foto. Se lo cuenta a su pareja, a su vecino, al chat del edificio. Ese momento vale más que cualquier volante, porque lo cuenta alguien que ya confía en nosotros."},
    {k:"rule", tone:"do", title:"Siempre", items:[
      "Pequeño y sin costo para el residente",
      "Solo con lo que Zing te da: el chocolate sale del carrito, nunca de la cocina del residente",
      "Sin mover nada personal ni de valor: acomodas, no reorganizas",
      "Los tres minutos van después de terminar el trabajo, nunca en lugar de él"
    ]},
    {k:"rule", tone:"dont", title:"Nunca", items:[
      "Dejar comida si el residente pidió no dejar nada o tiene mascotas sueltas",
      "Dejar notas con tu número personal: la relación es con Zing",
      "Que la magia tape un trabajo incompleto"
    ]},
    {k:"note", text:"Si te quedan pocos chocolates, pídelos a la oficina antes de que se acaben, igual que cualquier suministro."}
  ],
  quiz:[
    {q:"¿Cuándo haces los tres minutos de magia Zing?", opts:["Al llegar, para causar buena impresión","Al final, después de terminar todo el trabajo","En vez de una tarea si no alcanza el tiempo"], a:1,
     why:"La magia se suma al trabajo bien hecho. Nunca lo reemplaza ni tapa algo incompleto."},
    {q:"Se acabaron los chocolates del carrito y el residente tiene una caja en la cocina. ¿Dejas uno?", opts:["Sí, es un detalle","No: solo con lo que Zing te da, y pido más a la oficina","Sí, si dejo una nota"], a:1,
     why:"Nada del residente es material de Zing. Los suministros se piden antes de que se acaben."},
    {q:"¿Por qué un detalle pequeño ayuda a crecer el edificio?", opts:["Porque el residente paga más","Porque el residente lo cuenta a vecinos y en el chat, y eso trae referidos","Porque la administración lo ve"], a:1,
     why:"Lo que sorprende se cuenta. Y una recomendación de alguien que ya confía vale más que cualquier volante."}
  ]}
  ]}
];
