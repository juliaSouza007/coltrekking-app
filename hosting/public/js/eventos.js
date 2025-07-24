//administradores do sistema
var adminEmails = [
    "a2023952624@teiacoltec.org",
    "hh@teiacoltec.org"
];


//trata a exibicao do formulário de eventos
document.getElementById('createEvent').onclick = function () {
    showItem(eventForm);
    hideItem(loading);
    hideItem(editEventForm); // esconde o botão de editar
    showItem(submitEventForm); // mostra o botão de criar
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
    var data = new Date(document.getElementById('data').value + 'T00:00:00').toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    var dataInscricao = document.getElementById('dataInscricao').value;
    var dataPrelecao = document.getElementById('dataPrelecao').value;
    var localEncontro = document.getElementById('localEncontro').value;
    var descricao = document.getElementById('descricao').value;
    //var percursoAltimetria = document.getElementById('percursoAltimetria').files[0] ? document.getElementById('percursoAltimetria').files[0].name : '';

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
            //percursoAltimetria: percursoAltimetria
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

// função para preencher a lista de eventos
function fillEventList(dataSnapshot, user) {
    hideItem(eventForm);
    showItem(loading);

    var eventContainer = document.getElementById('eventContainer');
    eventContainer.innerHTML = ''; // Limpa o conteúdo
    var events = dataSnapshot.numChildren();
    eventCount.innerHTML = 'Total de eventos: ' + events;

    dataSnapshot.forEach(function (item) {
        var value = item.val();

        var eventCard = document.createElement('div');
        eventCard.className = 'event-card';
        eventCard.id = item.key; // Define o ID do card como a chave do evento

        eventCard.innerHTML = `
            <h3>${value.nome}</h3>
            <p>Descrição: ${value.descricao || '---'}</p>
            <p>Data: ${value.data || '---'}</p>
            <p>Data de Inscrição: ${value.dataInscricao || '---'}</p>
            <p>Data da Preleção: ${value.dataPrelecao || '---'}</p>
            <p>Local da preleção: ${value.localEncontro || '---'}</p>
            <p>Dificuldade: ${value.dificuldade || '---'}</p>
            <p>Distância: ${value.distancia || '---'} km</p>
            <p>Trajeto: ${value.trajeto || '---'}</p>    
        `;

        /* inserir altimentria depois (precisa do cloud storage)
            <p>Altimetria:<br>
                ${value.percursoAltimetria
                ? `<img src="${value.percursoAltimetria}" alt="altimetria" style="max-width: 100%;">`
                : '---'}
            </p>
        */

        // criar botão Remover
        if (user.email && adminEmails.includes(user.email)) {
            // criar botão Remover
            var removeBtn = document.createElement('button');
            removeBtn.textContent = 'Remover';
            removeBtn.className = 'danger eventBtn';
            removeBtn.onclick = function () {
                removeEvent(item.key);
            };

            // criar botão Editar
            var editBtn = document.createElement('button');
            editBtn.textContent = 'Editar';
            editBtn.className = 'alternative eventBtn';
            editBtn.onclick = function () {
                updateEvent(item.key);
            };

            // Adicionar os botões ao card
            eventCard.appendChild(removeBtn);
            eventCard.appendChild(editBtn);
        } else {
            // criar botão Inscrever-se
            var subscribeBtn = document.createElement('button');
            subscribeBtn.textContent = 'Inscrever-se';
            subscribeBtn.className = 'primary eventBtn';
            subscribeBtn.onclick = function () {
                const user = firebase.auth().currentUser;

                if (!user) {
                    alert('Você precisa estar logado para se inscrever.');
                    return;
                }

                const userId = user.uid;
                const email = user.email;
                const dataInscricao = new Date().toISOString(); // Horário atual da inscrição

                // Caminho: /inscricoes/eventoId/userId/
                const inscricaoRef = firebase.database().ref('inscricoes/' + item.key + '/' + userId);

                inscricaoRef.set({
                    email: email,
                    dataInscricao: dataInscricao
                }).then(() => {
                    alert('Inscrição realizada com sucesso!');
                    // Você pode desabilitar o botão ou mudar o texto
                    subscribeBtn.disabled = true;
                    subscribeBtn.textContent = 'Inscrito';
                }).catch((error) => {
                    console.error('Erro ao inscrever:', error);
                    alert('Erro ao realizar inscrição. Tente novamente.');
                });
            };


            // Adicionar o botão ao card
            eventCard.appendChild(subscribeBtn);
        }

        eventContainer.appendChild(eventCard);
    });

    hideItem(loading);
}

//botão para remover evento
function removeEvent(key) {
    var selectedItem = document.getElementById(key);

    // título dentro do elemento
    var eventName = selectedItem.querySelector('h3')?.textContent || 'evento';

    var confirmation = confirm('Você tem certeza que deseja remover o evento: "' + eventName + '"?');
    if (confirmation) {
        // Remover do Firebase
        dbRefEvents.child(key).remove().then(() => {
            selectedItem.remove();
        })
            .catch(function (error) {
                showError("Falha ao remover o evento: ", error);
            });
    }
}

//botão para editar evento
function updateEvent(key) {
    var selectedItem = document.getElementById(key);
    if (!selectedItem) {
        alert('Evento não encontrado.');
        return;
    }

    var eventName = selectedItem.querySelector('h3').textContent;
    var paragraphs = selectedItem.querySelectorAll('p');

    function getValue(text) {
        var parts = text.split(': ');
        return parts.length > 1 ? parts[1].trim() : '';
    }

    document.getElementById('nome').value = eventName;
    document.getElementById('descricao').value = getValue(paragraphs[0].textContent);
    document.getElementById('data').value = getValue(paragraphs[1].textContent);
    document.getElementById('dataInscricao').value = getValue(paragraphs[2].textContent);
    document.getElementById('dataPrelecao').value = getValue(paragraphs[3].textContent);
    document.getElementById('localEncontro').value = getValue(paragraphs[4].textContent);
    document.getElementById('dificuldade').value = getValue(paragraphs[5].textContent);

    let distanciaStr = getValue(paragraphs[6].textContent).replace(' km', '').trim();
    document.getElementById('distancia').value = distanciaStr;

    document.getElementById('trajeto').value = getValue(paragraphs[7].textContent);

    // Guardar o key para usar depois na atualização
    eventForm.dataset.editingKey = key;

    showItem(eventForm);
    //oculta o botão de submissão do formulário (cria um novo evento)
    hideItem(submitEventForm);
    showItem(editEventForm);
}

//trata a submissão do formulário de edição de eventos
document.getElementById('editEventForm').onclick = function () {
    var key = eventForm.dataset.editingKey;
    if (!key) {
        alert('Erro: nenhum evento em edição.');
        return;
    }

    // Pegando todos os valores do formulário
    var nome = document.getElementById('nome').value.trim();
    var distancia = document.getElementById('distancia').value.trim();
    var trajeto = document.getElementById('trajeto').value.trim();
    var dificuldade = document.getElementById('dificuldade').value.trim();
    var data = document.getElementById('data').value.trim();
    var dataInscricao = document.getElementById('dataInscricao').value.trim();
    var dataPrelecao = document.getElementById('dataPrelecao').value.trim();
    var localEncontro = document.getElementById('localEncontro').value.trim();
    var descricao = document.getElementById('descricao').value.trim();

    if (nome && distancia && trajeto && dificuldade && data && dataInscricao && dataPrelecao && localEncontro && descricao) {
        var dataToUpdate = {
            nome,
            distancia,
            trajeto,
            dificuldade,
            data,
            dataInscricao,
            dataPrelecao,
            localEncontro,
            descricao
        };

        dbRefEvents.child(key).update(dataToUpdate).then(() => {
            alert('Evento atualizado com sucesso!');
            eventForm.reset();
            hideItem(eventForm);
            showItem(submitEventForm);   // mostra de novo o botão de criar
            hideItem(editEventForm);     // esconde o botão de editar
            dbRefEvents.once('value').then(fillEventList);
        }).catch((error) => {
            showError('Erro ao atualizar evento:', error);
        });
    } else {
        alert('Por favor, preencha todos os campos para atualizar o evento.');
    }
};
