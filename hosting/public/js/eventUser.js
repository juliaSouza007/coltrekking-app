//administradores do sistema
var adminEmails = [
    "a2023952624@teiacoltec.org",
    "hh@teiacoltec.org"
];

// função para preencher a lista de eventos
function fillEventList(dataSnapshot) {
const eventContainer = document.getElementById('eventContainer');
    eventContainer.innerHTML = ''; // limpa o container para evitar duplicações
    const events = dataSnapshot.numChildren();
    eventCount.innerHTML = 'Total de eventos: ' + events;

    const uid = localStorage.getItem('uid');
    if (!uid) {
        console.warn('UID não encontrado no localStorage.');
        hideItem(loading);
        return;
    }

    firebase.database().ref('/users/' + uid).once('value')
        .then(userSnapshot => {
            dataSnapshot.forEach(item => {
                const value = item.val();
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
    const email = user.email;
    const name = user.displayName;
    const dataInscricao = Date.now(); // timestamp

    // Busca as informações adicionais do usuário no DB
    firebase.database().ref('users/' + uid).once('value')
        .then(snapshot => {
            const userData = snapshot.val() || {};

            const inscricaoRef = firebase.database().ref('inscricoes/' + eventId + '/' + uid);

            // Salva a inscrição com todas as infos
            return inscricaoRef.set({
                name: name,
                email: email,
                dataInscricao: dataInscricao,
                userId: userData.userId || '',
                userClass: userData.userClass || '',
                userCourse: userData.userCourse || ''
            });
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