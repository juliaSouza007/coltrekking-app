//traduz o conteúdo do site para português
firebase.auth().languageCode = 'pt-BR';

//administradores do sistema
var adminEmails = [
    "a2023952624@teiacoltec.org",
    "hh@teiacoltec.org"
];

//função que centraliza e trata a autenticação
firebase.auth().onAuthStateChanged(function(user) {
    hideItem(loading);

    if (user) {
        // Monta objeto com os dados que você quer guardar
        const userData = {
            uid: user.uid,
            nome: user.displayName || '',
            email: user.email,
        };

        // Salva no database na rota /users/{uid}
        firebase.database().ref('users/' + user.uid).set(userData).then(() => {
            console.log('Usuário salvo/atualizado com sucesso!');
        }).catch(error => {
            console.error('Erro ao salvar usuário:', error);
        });
        
        showUserContent(user);
        localStorage.setItem('uid', user.uid);
    } else {
        localStorage.removeItem('uid'); 
        showAuth();
    }
});

//função que permite o user sair de sua conta
function signOut() {
    firebase.auth().signOut().then(function() {
        window.location.href = 'index.html';
    }).catch(function(error) {
        showError("Erro ao sair: ", error);
    });
}

//função que permite o login com a conta do Google
function signInWithGoogle() {
    showItem(loading);
    //é possivel fazer com o firebase.auth().signInWithRedirect abrindo uma nova aba
    firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider()).then(function(result){
        if (adminEmails.includes(result.user.email)) {
            window.location.href = 'homeAdmin.html'; // Redireciona para a página de administração
        } else {
            window.location.href = 'homePage.html'; // Redireciona para a página inicial após o login
        }
    }).catch(function(error) {
        showError("Erro ao logar com o Google: ", error);
        hideItem(loading);
    }).finally(function() {
        hideItem(loading);
    });
}

//função que exclui a conta do Usuário
function deleteAccount() {
    var confirmation = confirm("Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.");
    if (confirmation) {
        showItem(loading);
        firebase.auth().currentUser.delete().then(function() {
            alert("Conta excluída com sucesso!");
            window.location.href = 'index.html';
        }).catch(function(error) {
            showError("Erro ao excluir conta: ", error);
        }).finally(function() {
            hideItem(loading);
        });
    }
}

//verifica se o usuário está autenticado com a conta institucional (para evitar redirecionamento desnecessário para homePage)
//RESTRINGE PARA CONTA INSTITUCIONAL (@TEIACOLTEC.ORG)
function checkAuth() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            const userEmail = user.email;

            if (!userEmail.endsWith("@teiacoltec.org")) {
                alert("Acesso negado. Conta não autorizada. Por favor, use um email institucional (@teiacoltec.org) para se autenticar.");
                firebase.auth().signOut();
            }
        } else {
            window.location.href = "index.html";
        }
    });
}
