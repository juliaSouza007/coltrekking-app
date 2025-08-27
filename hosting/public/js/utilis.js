//definindo referências para os elementos da pagina HTML
var loading = document.getElementById('loading');
var auth = document.getElementById('auth');
var homePage = document.getElementById('homePage');
var userEmail = document.getElementById('userEmail');
var userImg = document.getElementById('userImg');
var userName = document.getElementById('userName');

var userId = document.getElementById('userId');
var userClass = document.getElementById('userClass');
var userCourse = document.getElementById('userCourse');
var cpf = document.getElementById('cpf');
var turma = document.getElementById('turma');
var curso = document.getElementById('curso');
var editPersonalInfoForm = document.getElementById('editPersonalInfoForm');

//definindo referências para os eventos
var eventForm = document.getElementById('eventForm');
var submitEventForm = document.getElementById('submitEventForm');
var editEventForm = document.getElementById('editEventForm');
var eventContainer = document.getElementById('eventContainer');
var eventCount = document.getElementById('eventCount');

//remove elementos da aba
function hideItem(item) {
    if (item && item.style) {
        item.style.display = 'none';
    }
}

//oculta elementos da aba
function showItem(item) {
    if (item && item.style) {
        item.style.display = 'block';
    }
}

//mostrar conteúdo pra usuários não autenticados
function showAuth() {
    hideItem(homePage);
    showItem(auth);
}

//mostrar conteúdo para usuários autenticados
function showUserContent(user) {
    if (!user) return;

    // Exibe dados básicos do Auth
    if (userImg) userImg.src = user.photoURL ? user.photoURL : 'images/unknownUser.png';
    if (userName) userName.innerHTML = user.displayName || '';
    if (userEmail) userEmail.innerHTML = user.email || '';

    // Busca dados adicionais no BD
    firebase.database().ref('users/' + user.uid).once('value').then(snapshot => {
        const data = snapshot.val() || {};

        if (userId) userId.innerHTML = data.userId ? "CPF: " + data.userId : 'CPF: N/A';
        if (userClass) userClass.innerHTML = data.userClass ? "Turma: " + data.userClass : 'Turma: N/A';
        if (userCourse) userCourse.innerHTML = data.userCourse ? "Curso: " + data.userCourse : 'Curso: N/A';

        if ((userId && userId.innerHTML === 'CPF: N/A') ||
            (userClass && userClass.innerHTML === 'Turma: N/A') ||
            (userCourse && userCourse.innerHTML === 'Curso: N/A')) {
            alert('⚠️ Algumas informações do usuário estão faltando.\n' +
                'Sem elas não será possível realizar inscrições.\n' +
                'Por favor, edite suas informações pessoais.');
        }

        hideItem(auth);
        showItem(homePage);
    }).catch(error => {
        console.error("Erro ao buscar dados adicionais do usuário:", error);
        hideItem(auth);
        showItem(homePage);
    });
}


//editar informações pessoais do usuário
function editPersonalInfo() {
    const user = firebase.auth().currentUser;
    if (!user) return;

    const userRef = firebase.database().ref("users/" + user.uid);
    userRef.once("value").then(snapshot => {
        const data = snapshot.val() || {};

        // Preencher formulário com valores atuais
        document.getElementById('cpf').value = data.userId || "";
        document.getElementById('turma').value = data.userClass || "";
        document.getElementById('curso').value = data.userCourse || "";
    });

    showItem(editPersonalInfoForm);
}

function cancelEdit() {
    if (!editPersonalInfoForm) return;
    hideItem(editPersonalInfoForm);
    editPersonalInfoForm.reset();
}

//tratar o envio do formulário de edição de informações pessoais
if (editPersonalInfoForm) {
    editPersonalInfoForm.onsubmit = function (event) {
        event.preventDefault();
        const user = firebase.auth().currentUser;
        if (!user) return;

        const uid = user.uid;
        const cpf = document.getElementById('cpf').value.trim();
        const turma = document.getElementById('turma').value.trim();
        const curso = document.getElementById('curso').value.trim();

        firebase.database().ref('users/' + uid).update({
            userId: cpf,
            userClass: turma,
            userCourse: curso
        }).then(() => {
            alert('Informações atualizadas com sucesso!');

            // Atualiza os elementos da página imediatamente
            if (userId) userId.innerHTML = `CPF: ${cpf}`;
            if (userClass) userClass.innerHTML = `Turma: ${turma}`;
            if (userCourse) userCourse.innerHTML = `Curso: ${curso}`;

            hideItem(editPersonalInfoForm);
        }).catch(err => {
            console.error('Erro ao atualizar informações:', err);
            alert('Erro ao atualizar informações. Tente novamente.');
        });
    };
}

//centralizar e traduzir erros
function showError(prefix, error) {
    hideItem(loading);
    console.error(error.code);

    if (error.code) {
        switch (error.code) {
            case 'auth/popup-closed-by-user':
                alert(prefix + ' ' + 'Pop-up fechado pelo usuário antes da operação ser concluída!');
                break;
            default:
                alert(prefix + ' ' + error.message);
        }
    } else {
        alert('Erro desconhecido: ' + error);
    }
}

var actionCodeSettings = {
    url: 'coltrekking-app-c3026.firebaseapp.com'
}

var database = firebase.database();
var dbRefEvents = database.ref('event');

dbRefEvents.on('value', function (dataSnapshot) {
    fillEventList(dataSnapshot, firebase.auth().currentUser);
});
