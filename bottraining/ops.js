/* Zing Onboarding · Vía 1 — "Cómo Operamos"
   Capítulos transcritos del Manual de Onboarding – Equipo de Limpieza (checklist de 11 páginas).
   Cada capítulo: bloques de contenido + quiz obligatorio.
   Bloques: {k:'p'} párrafo · {k:'h'} subtítulo · {k:'check'} lista para marcar
            {k:'rule', tone:'do'|'dont'} reglas · {k:'say'} guion textual · {k:'note'} nota importante */

window.OPS = [
{ id:"bienvenida", icon:"🌿", mins:3,
  t:"Bienvenida a Zing",
  lead:"En Zing no solo limpiamos apartamentos. Cuidamos hogares, respetamos la intimidad y creamos experiencias.",
  blocks:[
    {k:"p", text:"Este manual explica paso a paso cómo realizar cada visita. No es una sugerencia: es la forma en que trabajamos en todas las limpiezas, sin excepción."},
    {k:"h", text:"Cada visita debe ser"},
    {k:"check", items:["Profesional","Segura","Consistente","Respetuosa"]},
    {k:"note", text:"Entrar al hogar de alguien es un privilegio. Todo lo que hacemos —cómo tocamos la puerta, cómo dejamos las toallas, cómo nos despedimos— comunica respeto."},
    {k:"h", text:"Cómo funciona este entrenamiento"},
    {k:"p", text:"Son dos partes. Primero “Cómo Operamos”: qué pasa antes, durante y después de cada visita. Después el “Manual de Limpieza”: cómo se ejecuta cada tarea. Al final de cada capítulo hay preguntas para confirmar que lo leíste. Tu progreso se guarda con tu teléfono, así que puedes salir y volver cuando quieras."},
    {k:"note", text:"Meta: completar todo en menos de una semana. Son unos 4 capítulos por día."}
  ],
  quiz:[
    {q:"¿Cómo describe Zing su trabajo?", opts:["Solo limpieza de apartamentos","Cuidar hogares, respetar la intimidad y crear experiencias","Un servicio de mantenimiento del edificio"], a:1,
     why:"Limpiamos, sí — pero lo que entregamos es cuidado, privacidad y una experiencia."},
    {q:"¿En cuáles limpiezas se sigue este manual?", opts:["Solo en la primera visita","Solo cuando el residente está presente","En todas las limpiezas, sin excepción"], a:2,
     why:"El manual se sigue en todas las visitas. La consistencia es lo que hace que el servicio se sienta profesional."}
  ]},

{ id:"antes", icon:"🧺", mins:4,
  t:"Antes de subir al apartamento",
  lead:"El trabajo empieza abajo, con el carrito. Si subes incompleta, pierdes tiempo y el residente lo nota.",
  blocks:[
    {k:"h", text:"Checklist de llegada"},
    {k:"check", items:[
      "Tengo todos los productos y equipos",
      "El carrito está limpio y organizado",
      "Revisé el calendario del día completo",
      "Entiendo tareas, notas y método de acceso",
      "Si hay duda → contacté a Soporte Zing",
      "Marqué que voy subiendo a la primera cita"
    ]},
    {k:"note", text:"Marcar que vas subiendo envía un SMS automático al residente. Nunca subas sin marcarlo: el residente espera ese aviso."},
    {k:"h", text:"Por qué revisar el día completo"},
    {k:"p", text:"Revisar el calendario completo —no solo la primera cita— te deja ver cuántas visitas tienes, qué tareas extra hay y dónde puede faltar tiempo. Es más fácil resolver un problema de horario a las 8 de la mañana que a la 1 de la tarde."}
  ],
  quiz:[
    {q:"¿Qué pasa cuando marcas que vas subiendo a la cita?", opts:["Se envía un SMS automático al residente","Se cierra la orden","Nada, es solo interno"], a:0,
     why:"El sistema avisa al residente por SMS. Por eso siempre hay que marcarlo antes de subir."},
    {q:"Antes de subir revisas el calendario…", opts:["Solo de la primera cita","Del día completo","De la semana"], a:1,
     why:"Del día completo: así sabes tareas, notas, accesos y si el tiempo alcanza."},
    {q:"Tienes una duda sobre el método de acceso de un apartamento. ¿Qué haces?", opts:["Subes y averiguas allá","Contactas a Soporte Zing antes de subir","Le escribes al residente directamente"], a:1,
     why:"Cualquier duda se resuelve con Soporte Zing antes de subir. Nunca improvises en la puerta."}
  ]},

{ id:"acceso", icon:"🔑", mins:4,
  t:"Acceso al apartamento",
  lead:"Hay dos métodos de acceso y un anuncio obligatorio al entrar.",
  blocks:[
    {k:"h", text:"Verifica el método de acceso"},
    {k:"p", text:"Antes de tocar, confirma en las notas si el acceso es Be Home o Código."},
    {k:"h", text:"Be Home"},
    {k:"check", items:["Toqué la puerta (respetuoso y audible)"]},
    {k:"h", text:"Código"},
    {k:"check", items:["Toqué la puerta","Esperé 15 segundos","Ingresé el código de las notas","Revisé si hay mascotas antes de entrar"]},
    {k:"h", text:"Al entrar (obligatorio)"},
    {k:"say", text:"“Hi, this is [tu nombre] with Zing!”"},
    {k:"note", text:"Siempre te anuncias en voz alta, aunque creas que no hay nadie dentro. Puede haber alguien trabajando desde casa, durmiendo o en el baño."}
  ],
  quiz:[
    {q:"Acceso por código. Tocas la puerta y…", opts:["Ingresas el código de inmediato","Esperas 15 segundos antes de ingresar el código","Esperas 2 minutos"], a:1,
     why:"Toca, espera 15 segundos y luego ingresa el código de las notas."},
    {q:"El apartamento parece vacío. ¿Te anuncias en voz alta?", opts:["No, si no hay nadie no hace falta","Sí, siempre, sin excepción","Solo si escuchas ruido"], a:1,
     why:"Anunciarse es obligatorio en toda visita: “Hi, this is [tu nombre] with Zing!”"},
    {q:"En acceso por código, ¿qué revisas antes de entrar?", opts:["Si hay mascotas","Si hay basura afuera","Si el aire está encendido"], a:0,
     why:"Revisa si hay mascotas antes de abrir del todo, por tu seguridad y la de la mascota."}
  ]},

{ id:"paneo", icon:"👀", mins:4,
  t:"Paneo rápido (1–2 min)",
  lead:"Antes de tocar un solo producto, mira el apartamento completo.",
  blocks:[
    {k:"h", text:"Evaluación inicial"},
    {k:"check", items:["Hice un paneo visual del apartamento","Confirmé que el tiempo asignado es suficiente"]},
    {k:"note", text:"Si el tiempo NO alcanza, avisa inmediatamente a Soporte Zing. Al inicio se puede ajustar; a mitad de la visita ya es un problema."},
    {k:"h", text:"Si el residente está presente"},
    {k:"check", items:["Saludé de forma cordial","Conversación breve permitida"]},
    {k:"p", text:"Una conversación corta es parte del servicio. Si pasa de 3 minutos, cierra con amabilidad:"},
    {k:"say", text:"“Muchas gracias, voy a comenzar para dedicarle el tiempo adecuado a su apartamento.”"}
  ],
  quiz:[
    {q:"Haces el paneo y ves que el apartamento está mucho más sucio de lo normal. El tiempo no alcanza.", opts:["Limpias rápido y sacrificas calidad","Avisas inmediatamente a Soporte Zing","Te quedas más tiempo sin avisar"], a:1,
     why:"Se avisa de inmediato, al inicio. Soporte ajusta el tiempo o el alcance."},
    {q:"El residente está en casa y la conversación pasa de 3 minutos. ¿Qué haces?", opts:["Sigues conversando","Cierras con amabilidad y comienzas","Sales del apartamento"], a:1,
     why:"Cordial y breve: “Muchas gracias, voy a comenzar para dedicarle el tiempo adecuado a su apartamento.”"}
  ]},

{ id:"ejecucion", icon:"🧴", mins:4,
  t:"Ejecución de tareas",
  lead:"El orden en que atacas el apartamento decide si te sobra o te falta tiempo.",
  blocks:[
    {k:"h", text:"Orden inteligente (para ganar tiempo)"},
    {k:"check", items:["Baños","Lavadora / secadora","Superficies con producto actuando","Seguí el Manual de Limpieza Zing"]},
    {k:"p", text:"La idea es simple: primero lo que necesita tiempo de espera. El producto trabaja solo mientras tú avanzas en otra cosa, y la lavadora corre mientras limpias."},
    {k:"h", text:"Uso del teléfono"},
    {k:"rule", tone:"do", title:"Permitido", items:["Comunicación con Soporte Zing","Emergencias únicamente"]},
    {k:"rule", tone:"dont", title:"Prohibido", items:["Atender llamadas personales dentro del apartamento"]},
    {k:"note", text:"Si es una emergencia real: sal al pasillo, atiende brevemente y regresa."}
  ],
  quiz:[
    {q:"¿Por qué se empieza por los baños y la lavadora?", opts:["Porque son las tareas más fáciles","Porque el producto y los ciclos trabajan mientras avanzas en otra cosa","Porque el residente lo pide"], a:1,
     why:"Es tiempo que corre solo: producto actuando y ciclos de lavado mientras limpias el resto."},
    {q:"Recibes una llamada personal dentro del apartamento.", opts:["La contestas en voz baja","No la contestas; el teléfono es solo para Soporte y emergencias","La contestas en la sala"], a:1,
     why:"Prohibido atender llamadas personales dentro del apartamento. Si es emergencia, sales al pasillo."}
  ]},

{ id:"tiempo", icon:"⏱", mins:3,
  t:"Control de tiempo y etiquetas",
  lead:"Tú manejas el reloj, y las etiquetas Zing muestran el trabajo terminado.",
  blocks:[
    {k:"h", text:"Control de tiempo"},
    {k:"check", items:["Estoy consciente del tiempo restante","Si necesito más tiempo → avisé a Soporte"]},
    {k:"h", text:"Etiquetas Zing"},
    {k:"p", text:"Se colocan en las zonas completadas para que el residente vea qué quedó listo:"},
    {k:"check", items:["Baño","Fregadero","Nevera","Otras zonas completadas"]},
    {k:"note", text:"Nunca extiendas la visita en silencio. Si necesitas más tiempo, Soporte tiene que saberlo para avisar al siguiente residente."}
  ],
  quiz:[
    {q:"Vas a necesitar 30 minutos más de lo asignado. ¿Qué haces?", opts:["Te quedas y lo comentas al final del día","Avisas a Soporte en el momento","Dejas tareas sin hacer y no dices nada"], a:1,
     why:"Avisas en el momento: hay otras citas después de la tuya."},
    {q:"¿Para qué sirven las etiquetas Zing?", opts:["Para mostrar al residente las zonas completadas","Para marcar lo que no se pudo limpiar","Para identificar tu carrito"], a:0,
     why:"Marcan las zonas terminadas —baño, fregadero, nevera y otras— y hacen visible el trabajo."}
  ]},

{ id:"cierre", icon:"✨", mins:4,
  t:"Cierre de la visita y Momento Zing",
  lead:"Los últimos minutos son los que el residente recuerda.",
  blocks:[
    {k:"h", text:"Chequeo final"},
    {k:"check", items:["Todas las tareas están completas","Todo quedó correctamente ejecutado"]},
    {k:"h", text:"Momento Zing (3 minutos)"},
    {k:"p", text:"Un detalle inesperado que nadie pidió. Tres minutos bien usados:"},
    {k:"check", items:["Acomodar cojines","Lavar una taza olvidada","Limpiar una mancha pequeña","Otro detalle positivo"]},
    {k:"h", text:"Despedida"},
    {k:"check", items:["Dejé la nota Thank You visible","Si es primera visita → dejé cepillo Zing","Avisé a Soporte que el apartamento está listo"]}
  ],
  quiz:[
    {q:"¿Qué es el Momento Zing?", opts:["Un descanso de 3 minutos","Un detalle extra inesperado para el residente","El tiempo para guardar el carrito"], a:1,
     why:"Tres minutos para un detalle que nadie pidió: cojines acomodados, una taza lavada, una mancha pequeña."},
    {q:"Es la primera visita a ese apartamento. Además de la nota Thank You, dejas…", opts:["Una tarjeta de presentación","El cepillo Zing","Una muestra de producto"], a:1,
     why:"En la primera visita se deja el cepillo Zing junto con la nota Thank You."},
    {q:"Terminaste todo. Antes de irte…", opts:["Avisas a Soporte que el apartamento está listo","Escribes al residente","No hace falta avisar"], a:0,
     why:"Soporte necesita saber que el apartamento quedó listo para cerrar la orden y avisar al residente."}
  ]},

{ id:"notas", icon:"🎙", mins:4,
  t:"Notas de voz",
  lead:"La nota de voz es cómo el residente sabe qué pasó en su casa. Es obligatoria.",
  blocks:[
    {k:"h", text:"Nota para el residente"},
    {k:"p", text:"Envía una nota de voz explicando:"},
    {k:"check", items:["Qué se hizo","Qué se observó","Expectativas futuras"]},
    {k:"h", text:"Ejemplos"},
    {k:"say", text:"“El vidrio de la ducha tiene acumulación; irá mejorando visita por visita.”"},
    {k:"say", text:"“Se limpiaron unas tazas adicionales que encontré en el fregadero.”"},
    {k:"h", text:"Nota interna (si aplica)"},
    {k:"check", items:["Apartamento toma más tiempo","Apartamento muy ordenado","Mascotas (con nombres incluidos)"]},
    {k:"note", text:"Explicar lo que observaste evita quejas. Si la acumulación va a tomar varias visitas, decirlo antes convierte un reclamo en una expectativa."}
  ],
  quiz:[
    {q:"La nota de voz al residente incluye…", opts:["Solo lo que se hizo","Qué se hizo, qué se observó y expectativas futuras","Cuánto tiempo tardaste"], a:1,
     why:"Las tres cosas. Lo observado y las expectativas son lo que previene quejas."},
    {q:"El vidrio de la ducha tiene acumulación que no sale en una visita. ¿Qué haces?", opts:["No lo mencionas","Lo explicas en la nota de voz y dices que irá mejorando","Lo tallas hasta que salga aunque te tome el tiempo de otras tareas"], a:1,
     why:"Se explica: el residente entiende el proceso en vez de pensar que no se limpió."},
    {q:"El apartamento tiene mascotas. ¿Dónde queda registrado?", opts:["En la nota interna, con sus nombres","En la nota de voz al residente","No se registra"], a:0,
     why:"La nota interna es para el equipo: mascotas con nombres, tiempo real del apartamento, orden."}
  ]},

{ id:"reglas", icon:"🔒", mins:5,
  t:"Reglas de oro",
  lead:"Estas reglas no se negocian. Protegen al residente, a Zing y a ti.",
  blocks:[
    {k:"h", text:"Privacidad"},
    {k:"rule", tone:"dont", title:"Nunca", items:["Abrir closets o gabinetes cerrados"]},
    {k:"rule", tone:"do", title:"Siempre", items:["Dejar las cosas donde estaban"]},
    {k:"h", text:"Basura"},
    {k:"check", items:["No botar nada que esté fuera de los basureros","Si hay duda → foto + Soporte","Si el residente está presente → preguntar"]},
    {k:"h", text:"Cámaras"},
    {k:"p", text:"Muchos apartamentos tienen cámaras. La regla es la misma con o sin cámara: trata la casa con respeto absoluto."},
    {k:"rule", tone:"dont", title:"Prohibido dentro del apartamento", items:["Sentarse en sofás","Usar vasos","Comer","Usar el baño"]}
  ],
  quiz:[
    {q:"Encuentras una caja fuera del basurero y no sabes si es basura.", opts:["La botas, estaba en el piso","Tomas foto y consultas a Soporte; si el residente está, preguntas","La dejas y no dices nada"], a:1,
     why:"Solo se bota lo que está dentro de los basureros. Ante la duda: foto + Soporte, o preguntar al residente."},
    {q:"¿Puedes abrir un closet cerrado para guardar algo?", opts:["Sí, si es para ordenar","No, nunca se abren closets o gabinetes cerrados","Solo si el residente no está"], a:1,
     why:"Nunca. La privacidad del residente es intocable."},
    {q:"¿Cuál de estas cosas está permitida dentro del apartamento?", opts:["Sentarte en el sofá para descansar","Usar el baño del residente","Ninguna de las dos"], a:2,
     why:"Prohibido sentarse en sofás, usar vasos, comer o usar el baño."}
  ]},

{ id:"incidentes", icon:"⚠️", mins:3,
  t:"Incidentes y accidentes",
  lead:"Se rompió algo, se manchó algo, algo salió mal. Hay una sola respuesta correcta.",
  blocks:[
    {k:"h", text:"Accidentes"},
    {k:"check", items:["Avisé inmediatamente a Soporte Zing"]},
    {k:"rule", tone:"dont", title:"Nunca", items:["Resolver directamente con el residente","Ofrecer pagar o reponer algo por tu cuenta","Esconder o mover lo que pasó"]},
    {k:"note", text:"Zing se encarga de todo. Reportar un accidente no es un problema; ocultarlo sí lo es."},
    {k:"h", text:"Después de la visita"},
    {k:"check", items:["Me dirigí a la siguiente cita según el calendario"]}
  ],
  quiz:[
    {q:"Se te cae un adorno y se rompe. El residente está en casa.", opts:["Le ofreces pagarlo","Avisas inmediatamente a Soporte Zing y ellos se encargan","Lo botas y no lo mencionas"], a:1,
     why:"Nunca se resuelve directamente con el residente. Avisas a Soporte y Zing se encarga."},
    {q:"Ocultar un accidente pequeño…", opts:["Está bien si nadie lo nota","Nunca está bien; reportarlo es lo que se espera de ti","Depende del valor del objeto"], a:1,
     why:"Reportar es parte del trabajo. Ocultar es lo único que se considera una falta."}
  ]}
];
