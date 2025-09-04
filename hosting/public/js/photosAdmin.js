// administradores do sistema
var adminEmails = [
    "a2023952624@teiacoltec.org",
    "hh@teiacoltec.org"
];

// referencias do banco
const dbRefPhotosAdmin = firebase.database().ref('photos');
const dbRefEventsPhoto = firebase.database().ref('event');

const photoAdminForm = document.getElementById('photoAdminForm');

// verifica se o usuário é admin
function isAdmin() {
    const user = firebase.auth().currentUser;
    return user && adminEmails.includes(user.email);
}

// preencher lista de fotos 
function fillPhotoList() {
    photoContainer.innerHTML = '';

    firebase.database().ref('event').once('value').then(eventsSnapshot => {
        eventsSnapshot.forEach(eventSnap => {
            const eventKey = eventSnap.key;
            const eventData = eventSnap.val();

            firebase.database().ref('photos/' + eventKey).once('value').then(photoSnap => {
                const links = photoSnap.val() || [];
                const photoCard = document.createElement('div');
                photoCard.className = 'photo-card';

                let linksHTML = '---';
                if (links.length > 0) {
                    linksHTML = links.map((link, i) => {
                        return `<a href="${link}" target="_blank">Link ${i+1}</a>`;
                    }).join(' | ');
                }

                photoCard.innerHTML = `
                    <h3>${eventData.nome}</h3>
                    <p>${linksHTML}</p>
                `;

                photoContainer.appendChild(photoCard);
            });
        });
    });
}

// exibir o formulário de admin
document.getElementById('createPhoto').onclick = function () {
    if (!isAdmin()) return;
    showItem(photoAdminForm);
    hideItem(loading);
}

// popular select de eventos para o formulário de fotos (só admin)
function populateEventSelectForPhotos() {
    if (!isAdmin()) return;
    const select = document.getElementById('selectEventForPhoto');
    select.innerHTML = '';

    dbRefEventsPhoto.once('value').then(snapshot => {
        snapshot.forEach(eventSnap => {
            const option = document.createElement('option');
            option.value = eventSnap.key;
            option.textContent = eventSnap.val().nome;
            select.appendChild(option);
        });
    });
}

// remover link (somente admin)
function removeLink(eventKey, linkIndex) {
    if (!isAdmin()) return;
    if (!confirm('Deseja remover este link?')) return;

    dbRefPhotosAdmin.child(eventKey).once('value').then(snapshot => {
        const links = snapshot.val() || [];
        links.splice(linkIndex, 1);
        dbRefPhotosAdmin.child(eventKey).set(links).then(() => fillPhotoList());
    });
}

// adicionar link (somente admin)
function addLink(eventKey, url) {
    if (!isAdmin()) return;
    if (!eventKey || !url) {
        alert('Selecione o evento e insira o link.');
        return;
    }

    dbRefPhotosAdmin.child(eventKey).once('value').then(snapshot => {
        const links = snapshot.val() || [];
        links.push(url);
        dbRefPhotosAdmin.child(eventKey).set(links).then(() => {
            fillPhotoList();
            document.getElementById('photoURL').value = '';
        });
    });

    hideItem(photoAdminForm);
}

// botão adicionar link
document.getElementById('addPhotoBtn').onclick = function(e) {
    e.preventDefault();
    if (!isAdmin()) return;
    const eventKey = document.getElementById('selectEventForPhoto').value;
    const url = document.getElementById('photoURL').value.trim();
    addLink(eventKey, url);
}

// inicializa controles admin
firebase.auth().onAuthStateChanged(user => {
    if (user && isAdmin()) {
        populateEventSelectForPhotos();
        showItem(document.getElementById('createPhoto'));
        showItem(photoAdminForm); // opcional: mostrar somente quando clicar
    } else {
        hideItem(document.getElementById('createPhoto'));
        hideItem(photoAdminForm);
    }
});
