const diaSemana = document.getElementById("dia-semana");
const diaMesAno = document.getElementById("dia-mes-ano");
const horaMinSeg = document.getElementById("hora-min-seg");
const divAlerta = document.getElementById("div-alerta");
const dialogPonto = document.getElementById("dialog-ponto");
const btnRegistrarPonto = document.getElementById("btn-registrar-ponto");
const btnDialogRegistrarPonto = document.getElementById("btn-dialog-registrar-ponto");
const btnDialogFechar = document.getElementById("btn-dialog-fechar");
const tabela = document.getElementById('tabelaRegistros').getElementsByTagName('tbody')[0];
const arrayDayWeek = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
let registroEditando = null;

// Funções auxiliares
function dataCompleta() {
    const date = new Date();
    return String(date.getDate()).padStart(2, '0') + "/" + String(date.getMonth() + 1).padStart(2, '0') + "/" + date.getFullYear();
}

function horaCompleta() {
    const date = new Date();
    return String(date.getHours()).padStart(2, '0') + ":" + String(date.getMinutes()).padStart(2, '0') + ":" + String(date.getSeconds()).padStart(2, '0');
}

function atualizaHora() {
    horaMinSeg.textContent = horaCompleta();
}

function carregarDataHora() {
    const today = new Date();
    diaSemana.textContent = arrayDayWeek[today.getDay()];
    diaMesAno.textContent = dataCompleta();
    atualizaHora();
}

carregarDataHora(); 
setInterval(atualizaHora, 1000); 
carregarRelatorio('todos'); 


btnRegistrarPonto.addEventListener("click", () => {
    dialogPonto.showModal();
    if (registroEditando) {
        document.getElementById("data-input").value = registroEditando.data;
        document.getElementById("select-tipos-ponto").value = registroEditando.tipo;
        document.getElementById("observacao").value = registroEditando.observacao;
    } else {
        document.getElementById("data-input").value = ""; 
        document.getElementById("select-tipos-ponto").value = "entrada"; 
        document.getElementById("observacao").value = ""; 
    }
});


btnDialogFechar.addEventListener("click", () => {
    dialogPonto.close();
    registroEditando = null; 
})

btnDialogRegistrarPonto.addEventListener("click", () => {
    const data = document.getElementById("data-input").value;
    const hora = horaCompleta();
    const tipoPonto = document.getElementById("select-tipos-ponto").value;
    const observacao = document.getElementById("observacao").value;

   
    const dataRegistro = new Date(data.split('/').reverse().join('-'));
    if (dataRegistro > new Date()) {
        alert("Não é permitido registrar pontos em datas futuras.");
        return;
    }

    const ponto = {
        data,
        hora,
        tipo: tipoPonto,
        observacao,
        id: registroEditando ? registroEditando.id : Date.now()
    };

    salvarRegistroLocalStorage(ponto);
    carregarRelatorio();
    dialogPonto.close();
});

function salvarRegistroLocalStorage(ponto) {
    let pontos = JSON.parse(localStorage.getItem("registro")) || [];
    
    if (registroEditando) {
        pontos = pontos.map(p => p.id === registroEditando.id ? ponto : p);
    } else {
        pontos.push(ponto);
    }

    localStorage.setItem("registro", JSON.stringify(pontos));
}


function carregarRelatorio(filtro = 'todos') {
    const registros = JSON.parse(localStorage.getItem("registro")) || [];
    tabela.innerHTML = '';

    const today = new Date();
    let dataLimite;

    
    if (filtro === 'semana') {
        dataLimite = new Date();
        dataLimite.setDate(today.getDate() - 7);
    } else if (filtro === 'mes') {
        dataLimite = new Date();
        dataLimite.setMonth(today.getMonth() - 1);
    }

    registros.forEach((registro) => {
        const registroData = new Date(registro.data.split('/').reverse().join('-'));

        
        if (filtro === 'todos' || (registroData >= dataLimite && registroData <= today)) {
            const row = tabela.insertRow();

            
            if (registroData < today) {
                row.classList.add('diferente'); 
            }

            row.insertCell(0).textContent = registro.data;
            row.insertCell(1).textContent = registro.hora;
            row.insertCell(2).textContent = registro.tipo;
            row.insertCell(3).textContent = registro.observacao || 'N/A';

            
            const editarButton = document.createElement('button');
            editarButton.textContent = 'Editar';
            editarButton.onclick = () => {
                editarRegistro(registro);
            };
            row.insertCell(4).appendChild(editarButton);

            
            const excluirButton = document.createElement('button');
            excluirButton.textContent = 'Excluir';
            excluirButton.onclick = () => {
                alert("O ponto não pode ser excluído.");
            };
            row.insertCell(5).appendChild(excluirButton);
        }
    });
}


function editarRegistro(registro) {
    registroEditando = registro;
    btnRegistrarPonto.click();}


document.getElementById("btn-filtrar-semana").addEventListener("click", () => {
    carregarRelatorio('semana');
});

document.getElementById("btn-filtrar-mes").addEventListener("click", () => {
    carregarRelatorio('mes');
});

document.getElementById("btn-filtrar-todos").addEventListener("click", () => {
    carregarRelatorio('todos');
});
const localizacaoElem = document.getElementById("localizacao");

function obterLocalizacao() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (posicao) => {
                const { latitude, longitude } = posicao.coords;
                localizacaoElem.textContent = `Latitude: ${latitude.toFixed(4)}, Longitude: ${longitude.toFixed(4)}`;
            },
            () => {
                localizacaoElem.textContent = "Não foi possível obter a localização.";
            }
        );
    } else {
        localizacaoElem.textContent = "Geolocalização não é suportada pelo seu navegador.";
    }
}

obterLocalizacao();


carregarDataHora();
setInterval(atualizaHora, 1000);
carregarRelatorio('todos'); 

