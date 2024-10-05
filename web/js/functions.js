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
      ${preguntaActual < preg.length - 1 ? `<button onclick="siguientePregunta()">Siguiente</button>` : ''}
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
            document.getElementById('enviarResultats').style.display = 'block';
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
        let resultHtml = `<h2>Resultados del Test</h2>`;
        resultHtml += `<p>Has acertado ${puntuacio} de ${preg.length} preguntas.</p>`;
        resultHtml += `<button id="reiniciarJuego" class="button-navegacion" onclick="reiniciarJuego()">Jugar Nuevamente</button>`;

        // Limpiar todo el contenido y mostrar solo el resultado
        document.getElementById('contenedor').innerHTML = resultHtml;

        // Ocultar otros elementos
        document.getElementById('estatPartida').style.display = 'none';
        document.getElementById('temporizadorContainer').style.display = 'none';
        document.getElementById('enviarResultats').style.display = 'none';
    })
    .catch(error => console.error('Error en fetch:', error));
}

// Nueva función para reiniciar el juego
function reiniciarJuego() {
    // Reiniciar todas las variables
    preg = [];
    puntuacio = 0;
    preguntaActual = 0;
    clearInterval(temporizador);
    document.getElementById('temporizador').textContent = ''; // Limpiar el temporizador

    // Reiniciar la interfaz de usuario
    document.getElementById('pantallaInicio').style.display = 'block';
    document.getElementById('estatPartida').style.display = 'none';
    document.getElementById('contenedor').innerHTML = ''; // Limpiar el contenedor de preguntas
    document.getElementById('enviarResultats').style.display = 'none'; // Ocultar botón de enviar resultados
    document.getElementById('temporizadorContainer').style.display = 'none'; // Ocultar temporizador

    // Limpiar el nombre y cantidad de preguntas
    document.getElementById('nombre').value = '';
    document.getElementById('cantidadPreguntas').value = '';
}

// Función para crear una nueva pregunta
document.getElementById('crearPreguntaForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const pregunta = document.getElementById('nuevaPregunta').value;
    const imatge = document.getElementById('nuevaImagen').value;

    fetch('../back/createPregunta.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            pregunta: pregunta,
            imatge: imatge
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Pregunta creada con éxito.');
            document.getElementById('nuevaPregunta').value = '';
            document.getElementById('nuevaImagen').value = '';
            cargarPreguntas(); // Recarga las preguntas
        }
    });
});

// Función para cargar las preguntas
function cargarPreguntas() {
    fetch('../back/readPreguntas.php')
        .then(response => response.json())
        .then(data => {
            const lista = document.getElementById('listaPreguntas');
            lista.innerHTML = ''; // Limpiar lista previa
            data.forEach(pregunta => {
                lista.innerHTML += `<div>
                    <strong>${pregunta.pregunta}</strong> <br>
                    <img src="${pregunta.imatge}" alt="Imagen" style="width:100px;"><br>
                    <button onclick="eliminarPregunta(${pregunta.id})">Eliminar</button>
                    <button onclick="mostrarFormularioActualizar(${pregunta.id}, '${pregunta.pregunta}', '${pregunta.imatge}')">Editar pregunta</button>
                </div>`;
            });
        })
}

// Función para eliminar pregunta
function eliminarPregunta(id) {
    fetch('../back/deletePregunta.php', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            id: id
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Pregunta eliminada con éxito.');
            cargarPreguntas(); // Recarga las preguntas
        }
    });
}

// Mostrar el formulario para actualizar la pregunta
function mostrarFormularioActualizar(id, pregunta, imatge) {
    document.getElementById('nuevaPregunta').value = pregunta;
    document.getElementById('nuevaImagen').value = imatge;
    document.getElementById('crearPreguntaForm').onsubmit = function(e) {
        e.preventDefault();
        actualizarPregunta(id);
    };
}

// Función para actualizar pregunta
function actualizarPregunta(id) {
    const pregunta = document.getElementById('nuevaPregunta').value;
    const imatge = document.getElementById('nuevaImagen').value;

    fetch('updatePregunta.php', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            id: id,
            pregunta: pregunta,
            imatge: imatge
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Pregunta actualizada con éxito.');
            cargarPreguntas(); // Recarga las preguntas
            document.getElementById('nuevaPregunta').value = '';
            document.getElementById('nuevaImagen').value = '';
        }
    });
}

// Cargar preguntas al inicio
document.addEventListener('DOMContentLoaded', cargarPreguntas);
