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
        const userRef = firebase.database().ref('users/' + user.uid);

        userRef.once('value').then(snapshot => {
            if (!snapshot.exists()) {
                // cria com role "user" por padrão
                const userData = {
                    uid: user.uid,
                    nome: user.displayName || '',
                    email: user.email,
                    role: "user"
                };

                userRef.set(userData)
                .then(() => console.log('Usuário criado com sucesso!'))
                .catch(error => console.error('Erro ao salvar usuário:', error));
            } else {
                console.log("Usuário já existe no banco.");
            }
        });

        // Guarda UID no localStorage
        localStorage.setItem('uid', user.uid);

        // Mostrar conteúdo do usuário
        showUserContent(user);

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

    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
        .then(result => {
            const user = result.user;
            const userRef = firebase.database().ref('users/' + user.uid + '/role');

            // Pega o role do usuário
            return userRef.once('value');
        })
        .then(roleSnap => {
            const role = roleSnap.val();
            if (role === 'admin') {
                window.location.href = 'homeAdmin.html';
            } else {
                window.location.href = 'homePage.html';
            }
        })
        .catch(error => {
            showError("Erro ao logar com o Google: ", error);
        })
        .finally(() => {
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

// Função que alterna a exibição da div de gerenciamento
function toggleUserManager() {
    const div = document.getElementById("userManager");
    const user = firebase.auth().currentUser;

    if (!user) {
        alert("Você precisa estar logado para gerenciar usuários.");
        return;
    }

    // Recarrega info do usuário para garantir dados atualizados
    user.reload().then(() => {
        const uid = user.uid;

        // Verifica role do usuário atual
        firebase.database().ref("users/" + uid).once("value")
            .then(snap => {
                const role = snap.val()?.role;
                console.log("Role do usuário atual:", role);
                if (role !== "admin") {
                    alert("Você não tem permissão para gerenciar usuários.");
                    return;
                }

                // Alterna a visibilidade da div
                if (div.style.display === "none") {
                    div.style.display = "block";
                    loadUsers(); // carrega a lista de usuários
                } else {
                    div.style.display = "none";
                }
            })
            .catch(err => console.error("Erro ao verificar role:", err));
    });
}

// Função que carrega todos os usuários do BD
function loadUsers() {
    const userList = document.getElementById("userList");
    userList.innerHTML = "<p>Carregando usuários...</p>";

    firebase.database().ref("users").once("value")
        .then(snapshot => {
            userList.innerHTML = ""; // limpa antes de popular

            snapshot.forEach(childSnap => {
                const user = childSnap.val();
                const uid = childSnap.key;

                const userCard = document.createElement("div");
                userCard.className = "user-card";
                userCard.innerHTML = `
                    <p><strong>Nome:</strong> ${user.nome || "---"}</p>
                `;

                // Se não for admin, mostra botão de promover
                if (user.role !== "admin") {
                    const promoteBtn = document.createElement("button");
                    promoteBtn.textContent = "Promover a Admin";
                    promoteBtn.className = "primary";
                    promoteBtn.onclick = () => promoteToAdmin(uid);
                    userCard.appendChild(promoteBtn);
                } else {
                    const demoteBtn = document.createElement("button");
                    demoteBtn.textContent = "Remover Admin";
                    demoteBtn.className = "danger";
                    demoteBtn.onclick = () => demoteFromAdmin(uid);
                    userCard.appendChild(demoteBtn);
                }

                userList.appendChild(userCard);
            });
        })
        .catch(err => console.error("Erro ao carregar usuários:", err));
}

// Função para promover um usuário a admin
function promoteToAdmin(uid) {
    firebase.database().ref("users/" + uid).update({ role: "admin" })
        .then(() => {
            alert("Usuário promovido a admin!");
            loadUsers(); // atualiza a lista
        })
        .catch(err => console.error("Erro ao promover usuário:", err));
}

// Função para remover a role de admin
function demoteFromAdmin(uid) {
    firebase.database().ref("users/" + uid).update({ role: "user" })
        .then(() => {
            alert("Admin removido!");
            loadUsers(); // atualiza a lista
        })
        .catch(err => console.error("Erro ao remover admin:", err));
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
