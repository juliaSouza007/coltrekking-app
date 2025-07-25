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
    console.log(user);

    userImg.src = user.photoURL ? user.photoURL : 'images/unknownUser.png';
    userName.innerHTML = user.displayName ? user.displayName : '';
    /*
    userId.innerHTML = user.id ? user.id : 'CPF: ' + 'N/A';
    userClass.innerHTML = user.class ? user.class : 'Turma: '+ 'N/A';
    userCourse.innerHTML = user.course ? user.course : 'Curso: ' + 'N/A';

    if (userId || userClass || userCourse === 'N/A') {
        alert('⚠️ Algumas informações do usuário estão faltando. ⚠️\n' +
            'Sem essas informações, não será possível realizar a inscrição em eventos.\n' +
            'Por favor, edite suas informações pessoais.');
    }
    */
    userEmail.innerHTML = user.email;
    hideItem(auth);

    showItem(homePage);
}

//editar informações pessoais do usuário
function editPersonalInfo() {
    showItem(editPersonalInfoForm);
}

function cancelEdit() {
    hideItem(editPersonalInfoForm);
    editPersonalInfoForm.reset();
}

/*
editPersonalInfoForm.onsubmit = function (event) {
    event.preventDefault();
    hideItem(editPersonalInfoForm);

    var newUserId = document.getElementById('userId').value;
    var newUserClass = document.getElementById('userClass').value;
    var newUserCourse = document.getElementById('userCourse').value;

    if (newName) {
        userName.innerHTML = newName;
        showItem(loading);
        firebase.auth().currentUser.updateProfile({
            displayName: newName
        }).catch(function(error) {
            showError("Erro ao atualizar nome de usuário: ", error);
        }).finally(function() {
            hideItem(loading);
        });
    } else {
        alert("Nome de usuário não fornecido. A atualização foi cancelada.");
        hideItem(loading);
    }
}
*/
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
