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
function fillEventList(dataSnapshot) {
    const eventContainer = document.getElementById('eventContainer');
    eventContainer.innerHTML = ''; // limpa o container para evitar duplicações
    const events = dataSnapshot.numChildren();
    eventCount.innerHTML = 'Total de eventos: ' + events;

    // pega UID do usuário logado do localStorage
    const uid = localStorage.getItem('uid');

    if (!uid) {
        console.warn('UID não encontrado no localStorage.');
        hideItem(loading);
        return;
    }

    // busca email do usuário no Firebase
    firebase.database().ref('/users/' + uid).once('value')
        .then(userSnapshot => {
            const userData = userSnapshot.val();
            const userEmail = userData ? userData.email : null;

            dataSnapshot.forEach(item => {
                const value = item.val();

                // Evita criar cards duplicados
                if (document.getElementById(item.key)) return;

                const eventCard = document.createElement('div');
                eventCard.className = 'event-card';
                eventCard.id = item.key;

                eventCard.innerHTML = `
                    <h3>${value.nome}</h3>
                    <p>Descrição: ${value.descricao || '---'}</p>
                    <p>Data: ${value.data ? formattedDate(value.data) : '---'}</p>
                    <p>Data de Inscrição: ${value.dataInscricao ? formattedDate(value.dataInscricao) : '---'}</p>
                    <p>Data da Preleção: ${value.dataPrelecao ? formattedDate(value.dataPrelecao) : '---'}</p>
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

                // BOTÕES DE ADMIN
                if (userEmail && adminEmails.includes(userEmail)) {
                    const removeBtn = document.createElement('button');
                    removeBtn.textContent = 'Remover';
                    removeBtn.className = 'danger eventBtn';
                    removeBtn.onclick = () => removeEvent(item.key);

                    const editBtn = document.createElement('button');
                    editBtn.textContent = 'Editar';
                    editBtn.className = 'alternative eventBtn';
                    editBtn.onclick = () => updateEvent(item.key);

                    const listarInscricoesBtn = document.createElement('button');
                    listarInscricoesBtn.textContent = 'Baixar Planilha de Inscrições';
                    listarInscricoesBtn.className = 'eventBtn';
                    listarInscricoesBtn.onclick = () => listarInscricoes(item.key, value.nome);

                    eventCard.appendChild(removeBtn);
                    eventCard.appendChild(editBtn);
                    eventCard.appendChild(listarInscricoesBtn);
                }

                // BOTÕES DE USUÁRIO
                else {
                    const subscribeBtn = document.createElement('button');
                    subscribeBtn.textContent = 'Inscrever-se';
                    subscribeBtn.className = 'primary eventBtn';
                    subscribeBtn.disabled = false;

                    // Verifica inscrição
                    firebase.database().ref('inscricoes/' + item.key + '/' + uid)
                        .once('value')
                        .then(snapshot => {
                            if (snapshot.exists()) {
                                subscribeBtn.disabled = true;
                                subscribeBtn.textContent = 'Inscrito';
                                subscribeBtn.classList.remove('primary');
                                subscribeBtn.classList.add('disabled');
                            }
                        });

                    subscribeBtn.onclick = () => subscribeToEvent(item.key, subscribeBtn);
                    eventCard.appendChild(subscribeBtn);
                }

                eventContainer.appendChild(eventCard);
            });

            hideItem(loading);
        })
        .catch(err => {
            console.error('Erro ao buscar usuário:', err);
            hideItem(loading);
        });
}

//botão para remover evento
function removeEvent(key) {
    var selectedItem = document.getElementById(key);

    // título dentro do elemento
    var eventName = selectedItem.querySelector('h3')?.textContent || 'evento';

    var confirmation = confirm('Você tem certeza que deseja remover o evento: "' + eventName + '"?');
    if (confirmation) {
        // Referências
        var eventRef = dbRefEvents.child(key); // eventos/{key}
        var inscricoesRef = firebase.database().ref('inscricoes/' + key); // inscricoes/{key}

        // Executa as duas remoções em paralelo
        Promise.all([
            eventRef.remove(),
            inscricoesRef.remove()
        ])
            .then(() => {
                selectedItem.remove();
                console.log("Evento e inscrições removidos com sucesso.");
            })
            .catch(function (error) {
                showError("Falha ao remover o evento/inscrições: ", error);
            });
    }
}

//botão para editar evento
function updateEvent(key) {
    const eventRef = firebase.database().ref('event/' + key);

    eventRef.once('value').then(snapshot => {
        const value = snapshot.val();
        if (!value) {
            alert('Evento não encontrado no banco.');
            return;
        }

        // Preenche os campos diretamente com os valores salvos no BD
        document.getElementById('nome').value = value.nome || '';
        document.getElementById('descricao').value = value.descricao || '';
        document.getElementById('data').value = value.data || ''; // já no formato correto
        document.getElementById('dataInscricao').value = value.dataInscricao || '';
        document.getElementById('dataPrelecao').value = value.dataPrelecao || '';
        document.getElementById('localEncontro').value = value.localEncontro || '';
        document.getElementById('dificuldade').value = value.dificuldade || '';
        document.getElementById('distancia').value = value.distancia || '';
        document.getElementById('trajeto').value = value.trajeto || '';

        // Guarda a key para usar depois na atualização
        eventForm.dataset.editingKey = key;

        // Mostra formulário de edição
        showItem(eventForm);
        hideItem(submitEventForm);
        showItem(editEventForm);
    });
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
                dataInscricao: data.dataInscricao || null // aqui deve ser timestamp salvo no banco
            });
        });

        // mais antigo primeiro (ordenando pelo timestamp)
        inscricoes.sort((a, b) => (a.dataInscricao || 0) - (b.dataInscricao || 0));

        // Função para formatar timestamp no fuso de Brasília
        function formatarData(ts) {
            if (!ts) return '---';
            const dateObj = new Date(ts);
            return dateObj.toLocaleString('pt-BR', {
                timeZone: 'America/Sao_Paulo',
                hour12: false
            });
        }

        // Montar CSV com separador ";"
        let csvRows = [];
        csvRows.push(["Email", "Data de Inscrição"]);
        inscricoes.forEach(insc => {
            csvRows.push([
                `"${(insc.email || '').replace(/"/g, '""')}"`,
                `"${formattedDate(insc.dataInscricao)}"`
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
    const dataInscricao = Date.now();;   

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
