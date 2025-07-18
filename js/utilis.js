//definindo referências para os elementos da pagina HTML
var loading = document.getElementById('loading');
var auth = document.getElementById('auth');
var userContent = document.getElementById('userContent');
var userEmail = document.getElementById('userEmail');
var userImg = document.getElementById('userImg');
var userName = document.getElementById('userName');

//remove elementos da aba
function hideItem(item) {
    item.style.display = 'none';
}

//oculta elementos da aba
function showItem(item) {
    item.style.display = 'block';
}

//mostrar conteúdo pra usuários não autenticados
function showAuth() {
    authForm.email.value = '';
    authForm.password.value = '';
    hideItem(userContent);
    showItem(auth);
}

//mostrar conteúdo para usuários autenticados
function showUserContent(user) {
    console.log(user);

    userImg.src = user.photoURL ? user.photoURL : 'images/unknownUser.png';
    userName.innerHTML = user.displayName ? user.displayName : '';

    userEmail.innerHTML = user.email;
    hideItem(auth);

    showItem(userContent);
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
    //url: ''
}

//var database = firebase.database();
//var dbRefUsers = database.ref('users');