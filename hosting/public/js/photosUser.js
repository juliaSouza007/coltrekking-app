// referencias do banco
const dbRefPhotos = firebase.database().ref('photos');
const photoContainer = document.getElementById('photoContainer');

// preencher lista de fotos (todos veem)
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

// inicializa para usuários
firebase.auth().onAuthStateChanged(user => {
    if (user) {
        fillPhotoList();
    }
});
