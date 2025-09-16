//administradores do sistema
var adminEmails = [
    "a2023952624@teiacoltec.org",
    "hh@teiacoltec.org"
];

// função para preencher a lista de eventos
function fillEventList(dataSnapshot) {
    const eventContainer = document.getElementById('eventContainer');
    const eventCount = document.getElementById('eventCount');
    eventContainer.innerHTML = ''; // limpa container
    eventCount.innerHTML = 'Carregando eventos...';

    // converte dataSnapshot em array e ordena por dataInscricao decrescente
    const eventosArray = [];
    dataSnapshot.forEach(item => {
        eventosArray.push({ key: item.key, value: item.val() });
    });

    eventosArray.sort((a, b) => {
        const tA = a.value.dataInscricao ? new Date(a.value.dataInscricao).getTime() : 0;
        const tB = b.value.dataInscricao ? new Date(b.value.dataInscricao).getTime() : 0;
        return tB - tA; // mais recente primeiro
    });

    const uid = localStorage.getItem('uid');
    if (!uid) {
        console.warn('UID não encontrado no localStorage.');
        hideItem(loading);
        return;
    }

    firebase.database().ref('/users/' + uid).once('value')
        .then(userSnapshot => {
            eventCount.innerHTML = 'Total de eventos: ' + eventosArray.length;

            eventosArray.forEach(item => {
                const value = item.value;
                if (document.getElementById(item.key)) return; // evita duplicação

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

                // botão de inscrição
                const subscribeBtn = document.createElement('button');
                subscribeBtn.textContent = 'Inscrever-se';
                subscribeBtn.className = 'primary eventBtn';
                subscribeBtn.disabled = false;

                // botão de cancelar inscrição
                const unsubscribeBtn = document.createElement('button');
                unsubscribeBtn.textContent = 'Cancelar inscrição';
                unsubscribeBtn.className = 'danger eventBtn';
                unsubscribeBtn.style.display = 'none';

                // verifica se o usuário já está inscrito
                firebase.database().ref('inscricoes/' + item.key + '/' + uid)
                    .once('value')
                    .then(snapshot => {
                        if (snapshot.exists()) {
                            subscribeBtn.style.display = 'none';
                            unsubscribeBtn.style.display = 'inline-block';
                        }
                    });

                subscribeBtn.onclick = () => {
                    subscribeToEvent(item.key, subscribeBtn);
                    subscribeBtn.style.display = 'none';
                    unsubscribeBtn.style.display = 'inline-block';
                };

                unsubscribeBtn.onclick = () => {
                    unsubscribeFromEvent(item.key, unsubscribeBtn);
                    unsubscribeBtn.style.display = 'none';
                    subscribeBtn.style.display = 'inline-block';
                };

                eventCard.appendChild(subscribeBtn);
                eventCard.appendChild(unsubscribeBtn);

                eventContainer.appendChild(eventCard);
            });

            hideItem(loading);
        })
        .catch(err => {
            console.error('Erro ao buscar usuário:', err);
            hideItem(loading);
        });
}


//trata a inscrição em eventos
function subscribeToEvent(eventId, subscribeBtn) {
    const user = firebase.auth().currentUser;

    if (!user) {
        alert('Você precisa estar logado para se inscrever.');
        return;
    }

    const uid = user.uid;
    const dataInscricao = Date.now(); // timestamp

    const inscricaoRef = firebase.database().ref(`inscricoes/${eventId}/${uid}`);

    inscricaoRef.set({
        dataInscricao: dataInscricao
    })
    .then(() => {
        alert('Inscrição realizada com sucesso!');
        subscribeBtn.disabled = true;
        subscribeBtn.textContent = 'Inscrito';
        subscribeBtn.classList.remove('primary');
        subscribeBtn.classList.add('disabled'); // opcional
    })
    .catch(error => {
        console.error('Erro ao inscrever:', error);
        alert('Erro ao realizar inscrição. Tente novamente.');
    });
}

//trata a desistência de eventos
function unsubscribeFromEvent(eventId, unsubscribeBtn) {
    const user = firebase.auth().currentUser;

    if (!user) {
        alert('Você precisa estar logado para cancelar a inscrição.');
        return;
    }

    const confirmar = confirm("Tem certeza que deseja cancelar sua inscrição?");
    if (!confirmar) return; // se cancelar, não faz nada

    const uid = user.uid;
    const inscricaoRef = firebase.database().ref(`inscricoes/${eventId}/${uid}`);

    inscricaoRef.remove()
        .then(() => {
            alert('Inscrição removida com sucesso!');
            unsubscribeBtn.disabled = true;
            unsubscribeBtn.textContent = 'Inscrição cancelada';
            unsubscribeBtn.classList.remove('danger');
            unsubscribeBtn.classList.add('disabled'); // opcional
        })
        .catch(error => {
            console.error('Erro ao remover inscrição:', error);
            alert('Erro ao cancelar inscrição. Tente novamente.');
        });
}