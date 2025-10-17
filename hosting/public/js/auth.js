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
                // Cria usuário com role "user" e able: true por padrão
                const userData = {
                    uid: user.uid,
                    nome: user.displayName || '',
                    email: user.email,
                    role: "user",
                    able: true,
                    pontos: 0 // <-- novo campo de pontuação inicial
                };
                return userRef.set(userData).then(() => {
                    console.log('Usuário criado com sucesso!');
                    return userData;
                });
            } else {
                const data = snapshot.val();
                let updates = {};

                // Se não tiver role, define como "user"
                if (!data.role) {
                    updates.role = "user";
                    data.role = "user";
                }

                // Se não tiver o campo able, define como true
                if (data.able === undefined) {
                    updates.able = true;
                    data.able = true;
                }

                // Se não tiver o campo pontos, inicia com 0
                if (data.pontos === undefined) {
                    updates.pontos = 0;
                    data.pontos = 0;
                }

                if (Object.keys(updates).length > 0) {
                    return userRef.update(updates).then(() => {
                        console.log('Dados de usuário atualizados:', updates);
                        return data;
                    });
                }

                return data;
            }
        }).then(userData => {
            // Salva UID no localStorage
            localStorage.setItem('uid', user.uid);

            // 🔢 Atualiza a pontuação na tela (se houver elemento)
            const pontosEl = document.getElementById('userPoints');
            if (pontosEl) {
                pontosEl.innerHTML = `Pontuação: ${userData.pontos || 0}`;
            }

            // Exibe o conteúdo normal
            showUserContent(user, userData.role, userData.able);
        }).catch(error => {
            console.error("Erro ao ler/criar usuário:", error);
        });

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
    const btn = document.querySelector("button[onclick='toggleUserManager()']"); // botão
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
                if (role !== "admin") {
                    alert("Você não tem permissão para gerenciar usuários.");
                    return;
                }

                // Alterna a visibilidade da div
                if (div.style.display === "none" || div.style.display === "") {
                    div.style.display = "block";
                    if (btn) btn.textContent = "Fechar"; // muda o texto
                    loadUsers(); // carrega a lista de usuários
                } else {
                    div.style.display = "none";
                    if (btn) btn.textContent = "Gerenciar Usuários"; // volta ao original
                }
            })
            .catch(err => console.error("Erro ao verificar role:", err));
    });
}

// Função que carrega todos os usuários do BD
function loadUsers() {
    const userList = document.getElementById("userList");
    userList.innerHTML = "<p>Carregando usuários...</p>";

    const searchTerm = document.getElementById("userSearch")?.value.trim().toLowerCase() || "";

    firebase.database().ref("users").once("value")
        .then(snapshot => {
            userList.innerHTML = ""; // limpa antes de popular

            snapshot.forEach(childSnap => {
                const user = childSnap.val();
                const uid = childSnap.key;

                // Filtra pelo início do nome
                if (searchTerm && !user.nome.toLowerCase().startsWith(searchTerm)) {
                    return; // ignora se não começar com o termo
                }

                const userCard = document.createElement("div");
                userCard.className = "user-card";

                const row = document.createElement("div");
                row.className = "user-row";

                const nameElem = document.createElement("span");
                nameElem.textContent = user.nome || "---";
                row.appendChild(nameElem);

                let actionBtn;
                if (user.role !== "admin") {
                    actionBtn = document.createElement("button");
                    actionBtn.textContent = "Promover a Admin";
                    actionBtn.className = "primary";
                    actionBtn.onclick = () => promoteToAdmin(uid);
                } else {
                    actionBtn = document.createElement("button");
                    actionBtn.textContent = "Remover Admin";
                    actionBtn.className = "danger";
                    actionBtn.onclick = () => demoteFromAdmin(uid);
                }
                row.appendChild(actionBtn);

                userCard.appendChild(row);
                userList.appendChild(userCard);
            });

            // Caso não encontre nenhum usuário
            if (userList.innerHTML === "") {
                userList.innerHTML = "<p>Nenhum usuário encontrado.</p>";
            }
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
