let preg = []; // Array para almacenar las preguntas
let puntuacio = 0; // Puntuación del jugador
let preguntaActual = 0; // Índice de la pregunta actual
let tiempoLimite = 30; // Tiempo límite por pregunta
let tiempoRestante; // Tiempo restante para la pregunta actual
let temporizador; // Temporizador para contar el tiempo

// Estado de la partida
let estatDeLaPartida = {
    contadorPreguntes: 0, // Contador de preguntas respondidas
};

// Evento para manejar el inicio del juego
document.getElementById('iniciarJuego').addEventListener('click', () => {
    const nombre = document.getElementById('nombre').value.trim();
    const cantidadPreguntasSeleccionadas = parseInt(document.getElementById('cantidadPreguntas').value.trim(), 10);

    // Verifica que el nombre no esté vacío y que la cantidad de preguntas sea válida
    if (nombre && !isNaN(cantidadPreguntasSeleccionadas) && cantidadPreguntasSeleccionadas > 0) {
        iniciarJuego(nombre, cantidadPreguntasSeleccionadas);
    } else {
        alert('Por favor, introduce tu nombre y la cantidad de preguntas que deseas.');
    }
});

// Función para iniciar el juego
function iniciarJuego(nombre, cantidadPreguntes) {
    console.log(`Iniciando juego para: ${nombre} con ${cantidadPreguntes} preguntas`);

    // Guarda el nombre en localStorage
    localStorage.setItem("nombreUsuario", nombre);

    // Oculta la pantalla de inicio
    document.getElementById('pantallaInicio').style.display = 'none';
    document.getElementById('estatPartida').style.display = 'block';
    document.getElementById('temporizadorContainer').style.display = 'block';

    // Fetch para obtener las preguntas desde el servidor
    fetch('../back/getPreguntas.php', {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor: ' + response.statusText);
        }
        return response.json(); // Parsear la respuesta como JSON
    })
    .then(fetchedData => {
        preg = fetchedData.slice(0, cantidadPreguntes); // Limitar la cantidad de preguntas
        iniciarTemporizador();
        mostrarPregunta(); // Muestra la primera pregunta
        mostrarEstatPartida(); // Muestra el estado de la partida inicialmente
    })
    .catch(error => console.error('Error en fetch:', error));
}

// Función para iniciar el temporizador
function iniciarTemporizador() {
    tiempoRestante = tiempoLimite;
    document.getElementById('temporizador').textContent = tiempoRestante;

    temporizador = setInterval(() => {
        tiempoRestante--;
        document.getElementById('temporizador').textContent = tiempoRestante;

        if (tiempoRestante <= 0) {
            clearInterval(temporizador);
            alert("¡Tiempo agotado!");
            enviarResultats(); // Envía resultados si el tiempo se agota
        }
    }, 1000);
}

// Función para mostrar la pregunta actual
function mostrarPregunta() {
    let htmlString = '';

    if (preguntaActual < preg.length) {
        let pregunta = preg[preguntaActual];

        htmlString += `<div class="question-container">`;
        htmlString += `<h3>${pregunta.pregunta}</h3>`;
        if (pregunta.imatge) {
            htmlString += `<img src="${pregunta.imatge}" class="img-quizz" /> <br>`;
        }

        // Muestra las respuestas posibles
        pregunta.respostes.forEach((respuesta, indexR) => {
            htmlString += `<button onclick="verificarResposta(${preguntaActual}, ${indexR})">${respuesta.resposta}</button>`;
        });

        htmlString += `</div>`;
    }

    // Agregamos los botones de navegación
    htmlString += `
    <br>
    <div class="navigation-buttons">
      ${preguntaActual > 0 ? `<button onclick="anteriorPregunta()">Anterior</button>` : ''}
      ${preguntaActual < preg.length - 1 ? `<button onclick="siguientePregunta()">Seguent</button>` : ''}
    </div>
    `;

    document.getElementById('contenedor').innerHTML = htmlString;
}

// Función para ir a la pregunta anterior
function anteriorPregunta() {
    if (preguntaActual > 0) {
        preguntaActual--;
        mostrarPregunta();
        mostrarEstatPartida();
    }
}

// Función para ir a la siguiente pregunta
function siguientePregunta() {
    if (preguntaActual < preg.length - 1) {
        preguntaActual++;
        mostrarPregunta();
        mostrarEstatPartida();
    }
}

// Función para verificar la respuesta y actualizar el estado de la partida
function verificarResposta(indexP, indexR) {
    if (preguntaActual < preg.length) {
        let pregunta = preg[indexP];

        // Verificar si la respuesta seleccionada es correcta
        if (pregunta.respostes[indexR].correcta) {
            puntuacio++; // Incrementar puntuación por respuesta correcta
        }

        // Incrementar el contador de preguntas respondidas
        estatDeLaPartida.contadorPreguntes++;

        // Mostrar la siguiente pregunta automáticamente después de responder
        siguientePregunta();
        mostrarEstatPartida();

        // Si se han respondido todas las preguntas, mostramos el botón para enviar los resultados
        if (estatDeLaPartida.contadorPreguntes === preg.length) {
            clearInterval(temporizador);
            document.getElementById('enviarResultatsContainer').style.display = 'block'; // Mostrar contenedor del botón
        }
    }
}

// Función para mostrar el estado de la partida
function mostrarEstatPartida() {
    // Mostrar "Pregunta x de y"
    let estatHtml = `<h3>Pregunta ${preguntaActual + 1} de ${preg.length}</h3>`;
    document.getElementById('estatPartida').innerHTML = estatHtml;
}

// Función para enviar los resultados al servidor
function enviarResultats() {
    let dadesResultats = {
        puntuacio: puntuacio,
        totalPreguntes: preg.length,
        respostes: preg.map((pregunta, index) => ({
            idPregunta: pregunta.id,
            respuestaSeleccionada: pregunta.respostes.map(res => res.resposta).join(', ')
        }))
    };

    fetch('../back/finalitza.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadesResultats)
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error('Error en la respuesta de la red.');
    })
    .then(data => {
        let resultHtml = `<h2>Resultats del test: </h2>`;
        resultHtml += `<p>Has encertat ${puntuacio} de ${preg.length} preguntes.</p>`;
        resultHtml += `<button id="reiniciarJuego" class="button-navegacion" onclick="reiniciarJuego()">Repetir test </button>`;

        // Limpiar todo el contenido y mostrar solo el resultado
        document.getElementById('contenedor').innerHTML = resultHtml;

        // Ocultar otros elementos
        document.getElementById('estatPartida').style.display = 'none';
        document.getElementById('temporizadorContainer').style.display = 'none';
        document.getElementById('enviarResultatsContainer').style.display = 'none';
    })
    .catch(error => console.error('Error al enviar los resultados:', error));
}

// Función para reiniciar el juego
function reiniciarJuego() {
    puntuacio = 0;
    preguntaActual = 0;
    estatDeLaPartida.contadorPreguntes = 0;
    document.getElementById('pantallaInicio').style.display = 'block'; // Volver a mostrar la pantalla de inicio
    document.getElementById('contenedor').innerHTML = ''; // Limpiar el contenedor
}
