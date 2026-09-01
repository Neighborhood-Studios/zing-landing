/* Zing Onboarding · Vía 2 — Quiz por tarea del Manual de Limpieza.
   Cada clave es un id de window.SOPS (sops.js). 2–3 preguntas por tarea. */

window.TASK_QUIZ = {
bano:[
  {q:"¿En qué momento se limpia el inodoro?", opts:["Primero, para quitarlo del camino","Siempre al final","Después del piso"], a:1,
   why:"Siempre al final, con un paño exclusivo para el exterior."},
  {q:"¿Por qué se pre-tratan ducha, tina, lavamanos e inodoro?", opts:["Para que el producto actúe mientras limpias el resto","Porque el producto huele mejor así","Para usar menos producto"], a:0,
   why:"Si no pre-tratas, tallas más fuerte y pierdes tiempo."},
  {q:"Hay mucho cabello en el piso del baño. ¿Qué haces antes de continuar?", opts:["Trapeas directamente","Barres antes de seguir","Lo dejas para el final"], a:1,
   why:"El cabello en el piso es una de las quejas más comunes: barrer y aspirar antes de trapear."}],

cocina:[
  {q:"¿Qué verificas antes de limpiar la estufa?", opts:["Que esté completamente apagada","Que el residente esté presente","Que el horno esté frío"], a:0,
   why:"Riesgo de accidente o daño si está encendida."},
  {q:"Acero inoxidable: ¿en qué dirección se limpia?", opts:["En círculos","En dirección de la veta","De abajo hacia arriba"], a:1,
   why:"Contra la veta deja marcas visibles."},
  {q:"El fregadero se limpia…", opts:["Antes de las encimeras","Después de las encimeras y se deja seco y brillante","Al mismo tiempo que el piso"], a:1,
   why:"Grifo primero, fregadero completo, pulir y dejar seco. Mojado deja manchas de agua."}],

dusting:[
  {q:"¿Qué se hace primero?", opts:["Los muebles y luego las áreas altas","High dusting y después las superficies","Solo lo que se ve sucio"], a:1,
   why:"Si limpias los muebles primero, el polvo de arriba vuelve a caer sobre lo limpio."},
  {q:"Hay un adorno sobre una mesa. ¿Cómo la limpias?", opts:["Limpias alrededor del adorno","Levantas el objeto, limpias la superficie, limpias el objeto y lo regresas al mismo lugar","Mueves el adorno a otro mueble"], a:1,
   why:"Limpiar alrededor deja marcas de polvo visibles — causa muy común de quejas."},
  {q:"La pantalla del televisor tiene polvo.", opts:["La limpias con glass cleaner","Solo desempolvas alrededor","La limpias con paño seco"], a:1,
   why:"Las pantallas se dañan fácilmente. Nunca se limpian."}],

pisos:[
  {q:"¿Se puede trapear un piso que no fue aspirado?", opts:["Sí, si se ve limpio","No, nunca","Sí, si el mop está muy mojado"], a:1,
   why:"El mop solo empuja polvo, cabello y suciedad si el piso no fue aspirado primero."},
  {q:"¿Hacia dónde se trapea?", opts:["Hacia el centro del cuarto","Hacia la salida","Empezando en la puerta"], a:1,
   why:"Empiezas en el área más alejada y trabajas hacia la salida para no pisar lo limpio."},
  {q:"¿Cómo debe estar el mop?", opts:["Empapado, para limpiar mejor","Húmedo, no goteando","Seco"], a:1,
   why:"Un mop empapado deja marcas y puede dañar pisos de madera."}],

ventanas:[
  {q:"Antes de aplicar limpiador al vidrio…", opts:["Se quita el polvo del marco y del vidrio","Se moja el vidrio con agua","Se cierra la ventana"], a:0,
   why:"Si aplicas limpiador sobre polvo, creas una capa de lodo difícil de remover."},
  {q:"Al terminar una ventana, ¿cómo confirmas que quedó bien?", opts:["Con tocarla basta","La miras desde diferentes ángulos","Le pasas más limpiador"], a:1,
   why:"Las rayas y marcas solo se ven desde ciertos ángulos."}],

horno:[
  {q:"Aplicaste el desengrasante. ¿Qué sigue?", opts:["Frotar de inmediato","Dejar actuar varios minutos","Enjuagar"], a:1,
   why:"Si no actúa, la grasa no se afloja y el trabajo se vuelve mucho más difícil."},
  {q:"Hay grasa quemada muy pegada. ¿Qué usas?", opts:["Un cuchillo","Una espátula o scraper plástico","Una esponja de metal"], a:1,
   why:"Las herramientas metálicas rayan el interior del horno."},
  {q:"¿Dónde NO se aplica producto?", opts:["En las paredes del horno","En resistencias, ventiladores y componentes eléctricos","En el interior de la puerta"], a:1,
   why:"Aplicar producto en partes eléctricas puede dañar el horno."}],

fridge:[
  {q:"¿Qué tipo de producto se usa dentro del refrigerador?", opts:["Químicos fuertes o abrasivos","Limpiador suave o multiuso con agua tibia","Desengrasante de horno"], a:1,
   why:"Los productos fuertes pueden contaminar alimentos y dejar olores."},
  {q:"Después de limpiar, antes de devolver los alimentos…", opts:["Secas completamente interior, bandejas y cajones","Los devuelves de inmediato","Dejas la puerta abierta una hora"], a:0,
   why:"La humedad genera olores. Todo debe quedar seco."},
  {q:"El cliente tiene su propia organización en la nevera.", opts:["La reorganizas mejor","La devuelves de forma similar a como estaba","Agrupas todo por color"], a:1,
   why:"No se altera la organización del cliente."}],

dishes:[
  {q:"Hay lavaplatos disponible y muchos platos sucios.", opts:["Lavas todo a mano","Usas el lavaplatos primero y lavas a mano lo que no debe ir","Solo usas el lavaplatos y dejas el resto"], a:1,
   why:"El lavaplatos es el método más eficiente; a mano van ollas grandes, tablas de madera y cuchillos delicados."},
  {q:"¿Hay que esperar a que termine el ciclo del lavaplatos?", opts:["Sí, siempre","No; el objetivo es dejar los platos en proceso de lavado","Sí, para guardarlos"], a:1,
   why:"El ciclo corre solo mientras avanzas con otras tareas."},
  {q:"Al terminar los platos…", opts:["Limpias el fregadero y el counter","Solo cierras la llave","Dejas los platos en el fregadero escurriendo"], a:0,
   why:"El área del fregadero debe quedar limpia y ordenada."}],

couch:[
  {q:"¿Dónde se acumulan más migas en un sofá?", opts:["En el respaldo","En las grietas entre cojines","En las patas"], a:1,
   why:"Siempre aspirar entre los cojines y revisar debajo antes de recolocarlos."},
  {q:"¿Se puede usar spray o producto líquido sobre el sofá?", opts:["Sí, un poco","No, puede manchar o dañar la tela","Solo agua"], a:1,
   why:"Este servicio es un refresh en seco: aspirar, esponjar y alinear."}],

laundry:[
  {q:"¿Qué detergente se usa?", opts:["El que traes en el carrito","El disponible en el hogar del cliente","Cualquiera"], a:1,
   why:"Siempre el detergente del cliente."},
  {q:"Terminó el ciclo de lavado y sigues ocupada en otra tarea.", opts:["Dejas la ropa en la lavadora hasta el final","Transfieres la ropa a la secadora","La sacas y la dejas en la canasta mojada"], a:1,
   why:"La ropa húmeda dentro de la lavadora genera malos olores."},
  {q:"¿Este servicio incluye doblar la ropa?", opts:["Sí, siempre","No, a menos que esté especificado","Solo si sobra tiempo"], a:1,
   why:"Laundry Service es una carga de lavado y una de secado. Doblar es un servicio aparte."}],

folding:[
  {q:"¿Dónde se dobla la ropa?", opts:["En cualquier superficie disponible","En una superficie limpia como la cama o una mesa","En el piso"], a:1,
   why:"La ropa limpia siempre se dobla sobre una superficie limpia."},
  {q:"¿Se guarda la ropa doblada en el closet o los cajones?", opts:["Sí, siempre","No, a menos que el cliente lo solicite específicamente","Solo la ropa interior"], a:1,
   why:"Se deja doblada en la canasta o sobre una superficie limpia."}],

"ext-windows":[
  {q:"¿Qué se limpia primero?", opts:["El vidrio","Los marcos y bordes","Los rieles"], a:1,
   why:"Si los marcos están sucios, la suciedad vuelve a caer sobre el vidrio limpio."},
  {q:"¿Qué NO incluye este servicio?", opts:["Puertas corredizas de vidrio","Limpieza básica de marcos","Limpieza exterior en alturas peligrosas y pressure washing"], a:2,
   why:"Solo vidrio exterior accesible. Nunca alturas peligrosas."}],

groceries:[
  {q:"¿Qué se guarda primero?", opts:["Los alimentos secos","Los refrigerados y congelados","Lo que esté más arriba en la bolsa"], a:1,
   why:"Los productos fríos se guardan primero para que no se pierdan."},
  {q:"Al terminar, ¿qué revisas?", opts:["Que todas las bolsas queden vacías","Que la nevera esté limpia","Que haya espacio en la despensa"], a:0,
   why:"Es común olvidar un artículo en el fondo de una bolsa."}],

deodorizing:[
  {q:"¿Cuánto producto se usa?", opts:["Bastante, para que dure","Lo mínimo: el aroma debe ser ligero y fresco","Depende del tamaño del cuarto"], a:1,
   why:"Demasiado producto genera un olor fuerte e incómodo."},
  {q:"¿Se rocía directamente sobre sofás, cortinas o ropa?", opts:["Sí","No","Solo sobre cortinas"], a:1,
   why:"Nunca sobre telas o muebles."}],

trash:[
  {q:"Hay una bolsa grande al lado del bote que no está dentro de ningún basurero.", opts:["La bajas junto con el resto","Solo retiras lo que está dentro de los botes; si hay duda, preguntas","La dejas en el pasillo"], a:1,
   why:"Solo se retira la basura dentro de los botes o lo que el cliente haya indicado."},
  {q:"El apartamento tiene bote de reciclaje.", opts:["Mezclas todo en una bolsa","Mantienes basura y reciclaje separados","Botas el reciclaje con la basura si va poco"], a:1,
   why:"Se mantienen separados y se llevan al área designada del edificio."}],

plants:[
  {q:"¿Cuánta agua se usa?", opts:["Toda la que aguante la maceta","Una cantidad moderada","Solo unas gotas"], a:1,
   why:"Demasiada agua puede dañar la planta."},
  {q:"El cliente dejó instrucciones específicas sobre sus plantas.", opts:["Sigues siempre sus instrucciones","Riegas todas por igual","Riegas solo las que se ven secas"], a:0,
   why:"Las instrucciones del cliente siempre manda."}]
};
