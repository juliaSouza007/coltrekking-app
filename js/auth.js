//traduz o conteúdo do site para português
firebase.auth().languageCode = 'pt-BR';

//função que centraliza e trata a autenticação
firebase.auth().onAuthStateChanged(function(user) {
    hideItem(loading);
    if (user) {
        showUserContent(user);
    } else {
        showAuth();
    }
});

//função que permite o user sair de sua conta
function signOut() {
    firebase.auth().signOut().catch(function(error) {
        console.error("Erro ao sair:", error);
    });
}

//função que permite o login com a conta do Google
function signInWithGoogle() {
    showItem(loading);
    //é possivel fazer com o firebase.auth().signInWithRedirect abrindo uma nova aba
    firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider()).catch(function(error) {
        showError("Erro ao logar com o Google: ", error);
        hideItem(loading);
    }).finally(function() {
        hideItem(loading);
    });
}

//função que atualiza o nome de usuário
function updateUsername() {
    var newName = prompt("Digite o novo nome de usuário:", userName.innerHTML);
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

//função que exclui a conta do Usuário
function deleteAccount() {
    var confirmation = confirm("Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.");
    if (confirmation) {
        showItem(loading);
        firebase.auth().currentUser.delete().then(function() {
            alert("Conta excluída com sucesso!");
        }).catch(function(error) {
            showError("Erro ao excluir conta: ", error);
        }).finally(function() {
            hideItem(loading);
        });
    }
}