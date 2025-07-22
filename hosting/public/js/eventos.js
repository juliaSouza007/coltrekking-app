//trata a exibicao do formulário de eventos
document.getElementById('createEvent').onclick = function () {
    showItem(eventForm);
    hideItem(loading);
    eventForm.reset();
}

//trata a submissão do formulário de eventos
eventForm.onsubmit = function (event) {
    event.preventDefault();
    hideItem(eventForm);
    showItem(loading);

    var nome = document.getElementById('nome').value;
    var distancia = document.getElementById('distancia').value;
    var trajeto = document.getElementById('trajeto').value;
    var dificuldade = document.getElementById('dificuldade').value;
    var data = document.getElementById('data').value;
    var dataInscricao = document.getElementById('dataInscricao').value;
    var dataPrelecao = document.getElementById('dataPrelecao').value;
    var localEncontro = document.getElementById('localEncontro').value;
    var descricao = document.getElementById('descricao').value;
    var percursoAltimetria = document.getElementById('percursoAltimetria').files[0] ? document.getElementById('percursoAltimetria').files[0].name : '';

    if (nome && distancia && trajeto && dificuldade && data && dataInscricao && dataPrelecao && localEncontro && descricao) {
        var newEventRef = dbRefEvents.push();
        newEventRef.set({
            nome: nome,
            distancia: distancia,
            trajeto: trajeto,
            dificuldade: dificuldade,
            data: data,
            dataInscricao: dataInscricao,
            dataPrelecao: dataPrelecao,
            localEncontro: localEncontro,
            descricao: descricao,
            percursoAltimetria: percursoAltimetria
        }).then(function () {
            alert('Evento criado com sucesso!');
            hideItem(loading);
            hideItem(eventForm);
        }).catch(function (error) {
            showError('Erro ao criar evento:', error);
            hideItem(loading);
            showItem(eventForm);
        });
    } else {
        alert('Por favor, preencha todos os campos do evento.');
        hideItem(loading);
        showItem(eventForm);
    }
}

//exibe os eventos existentes
function fillEventList(dataSnapshot) {
    hideItem(eventForm);
    showItem(loading);

    const eventContainer = document.getElementById('eventContainer');
    eventContainer.innerHTML = ''; // Limpa o conteúdo
    const events = dataSnapshot.numChildren();
    eventCount.innerHTML = 'Total de eventos: ' + events;

    dataSnapshot.forEach(function (item) {
        const value = item.val();

        const eventCard = document.createElement('div');
        eventCard.className = 'event-card';

        eventCard.innerHTML = `
            <h3>${value.nome}</h3>
            <p>Descrição: ${value.descricao || '---'}</p>
            <p>Data: ${value.data || '---'}</p>
            <p>Data de Inscrição:${value.dataInscricao || '---'}</p>
            <p>Data da Preleção: ${value.dataPrelecao || '---'}</p>
            <p>Local da preleção: ${value.localEncontro || '---'}</p>
            <p>Dificuldade: ${value.dificuldade || '---'}</p>
            <p>Distância: ${value.distancia || '---'} km</p>
            <p>Trajeto: ${value.trajeto || '---'}</p>
            <p>Altimetria:<br>
                ${value.percursoAltimetria 
                    ? `<img src="${value.percursoAltimetria}" alt="altimetria" style="max-width: 100%;">`
                    : '---'}
            </p>
        `;

        eventContainer.appendChild(eventCard);
    });

    hideItem(loading);
}

