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
    var data = document.getElementById('data').value;
    var dataInscricao = document.getElementById('dataInscricao').value;
    var dataPrelecao = document.getElementById('dataPrelecao').value;
    var localEncontro = document.getElementById('localEncontro').value;
    var descricao = document.getElementById('descricao').value;
    //var percursoAltimetria = document.getElementById('percursoAltimetria').files[0] ? document.getElementById('percursoAltimetria').files[0].name : '';

    //formatar datas 
    var formattedData = formattedDate(data);
    var formattedDataInscricao = formattedDate(dataInscricao);
    var formattedDataPrelecao = formattedDate(dataPrelecao);

    if (nome && distancia && trajeto && dificuldade && data && dataInscricao && dataPrelecao && localEncontro && descricao) {
        var newEventRef = dbRefEvents.push();
        newEventRef.set({
            nome: nome,
            distancia: distancia,
            trajeto: trajeto,
            dificuldade: dificuldade,
            data: formattedData,
            dataInscricao: formattedDataInscricao,
            dataPrelecao: formattedDataPrelecao,
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

        // BOTÕES DE ADMINISTRADORES
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

            // criar botão Ver Inscrições
            var listarInscricoesBtn = document.createElement('button');
            listarInscricoesBtn.textContent = 'Ver Inscrições';
            listarInscricoesBtn.className = 'eventBtn';
            listarInscricoesBtn.onclick = function () {
                listarInscricoes(item.key, value.nome);
            };

            // Adicionar os botões ao card
            eventCard.appendChild(removeBtn);
            eventCard.appendChild(editBtn);
            eventCard.appendChild(listarInscricoesBtn);

            // BOTÕES DE USUÁRIOS 
        } else {
            // criar botão Inscrever-se
            var subscribeBtn = document.createElement('button');
            subscribeBtn.textContent = 'Inscrever-se';
            subscribeBtn.className = 'primary eventBtn';

            subscribeBtn.disabled = false;

            // Verifica se o usuário já está inscrito
            const inscricaoRef = firebase.database().ref('inscricoes/' + item.key + '/' + user.uid);
            inscricaoRef.once('value').then(snapshot => {
                if (snapshot.exists()) {
                    subscribeBtn.disabled = true;
                    subscribeBtn.textContent = 'Inscrito';
                    subscribeBtn.classList.remove('primary');
                    subscribeBtn.classList.add('disabled');
                }
            });

            // ação de clique
            subscribeBtn.onclick = function () {
                subscribeToEvent(item.key, subscribeBtn);
            };

            // adicionar ao card
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
    document.getElementById('data').value = brDateTimeToInputDate(getValue(paragraphs[1].textContent));
    document.getElementById('dataInscricao').value = brDateTimeToInputDate(getValue(paragraphs[2].textContent));
    document.getElementById('dataPrelecao').value = brDateTimeToInputDate(getValue(paragraphs[3].textContent));
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

// botão para listar inscrições de um evento e exportar CSV
function listarInscricoes(eventId, nomeEvento = 'Evento') {
    const inscricoesRef = firebase.database().ref('inscricoes/' + eventId);

    inscricoesRef.once('value').then(snapshot => {
        if (!snapshot.exists()) {
            alert(`Nenhuma inscrição encontrada para "${nomeEvento}".`);
            return;
        }

        const inscricoes = [];
        snapshot.forEach(child => {
            const data = child.val();
            inscricoes.push({
                email: data.email || '---',
                dataInscricao: data.dataInscricao || '---'
            });
        });

        // mais antigo primeiro
        inscricoes.sort((a, b) => a.dataInscricao - b.dataInscricao);

        // Montar CSV com separador ";"
        let csvRows = [];
        csvRows.push(["Email", "Data de Inscrição"]); 
        inscricoes.forEach(insc => {
            csvRows.push([
                `"${(insc.email || '').replace(/"/g, '""')}"`,
                `"${(insc.dataInscricao || '').replace(/"/g, '""')}"`
            ]);
        });

        const csvString = csvRows.map(e => e.join(";")).join("\n");
        const blob = new Blob(["\uFEFF" + csvString], { type: "text/csv;charset=utf-8;" });

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", `${nomeEvento.replace(/\s+/g, '_')}_inscricoes.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    })
    .catch(error => {
        console.error('Erro ao buscar inscrições:', error);
        alert('Erro ao buscar inscrições.');
    });
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

//trata a inscrição em eventos
function subscribeToEvent(eventId, subscribeBtn) {
    const user = firebase.auth().currentUser;

    if (!user) {
        alert('Você precisa estar logado para se inscrever.');
        return;
    }

    const userId = user.uid;
    const email = user.email;
    const dataInscricao = horarioBrasilia(); // função já existente

    const inscricaoRef = firebase.database().ref('inscricoes/' + eventId + '/' + userId);

    inscricaoRef.set({
        email: email,
        dataInscricao: dataInscricao
    }).then(() => {
        alert('Inscrição realizada com sucesso!');
        subscribeBtn.disabled = true;
        subscribeBtn.textContent = 'Inscrito';
        subscribeBtn.classList.remove('primary');
        subscribeBtn.classList.add('disabled'); // opcional
    }).catch((error) => {
        console.error('Erro ao inscrever:', error);
        alert('Erro ao realizar inscrição. Tente novamente.');
    });
}
