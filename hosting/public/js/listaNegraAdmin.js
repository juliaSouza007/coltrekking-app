// abre/fecha a área de gerenciamento de bloqueios
function toggleBlockManager() {
    const div = document.getElementById("blockManager");
    const user = firebase.auth().currentUser;

    if (!user) {
        alert("Você precisa estar logado para gerenciar bloqueios.");
        return;
    }

    // Recarrega info do usuário para garantir dados atualizados
    user.reload().then(() => {
        const uid = user.uid;

        firebase.database().ref("users/" + uid).once("value")
            .then(snap => {
                const data = snap.val();
                const role = data ? data.role : null; // proteção

                if (role !== "admin") {
                    alert("Você não tem permissão para gerenciar bloqueios.");
                    return;
                }

                // Alterna a visibilidade da div
                if (div.style.display === "none" || div.style.display === "") {
                    div.style.display = "block";
                    loadBlockManager(); // carrega a lista de bloqueio
                } else {
                    div.style.display = "none";
                }
            })
            .catch(err => {
                console.error("Erro ao verificar role (toggleBlockManager):", err);
                alert("Erro ao verificar permissões. Tente novamente.");
            });
    });
}

// carrega todos os usuários com botões de bloquear/desbloquear
function loadBlockManager() {
    const blockList = document.getElementById("blockList");
    blockList.innerHTML = "<p>Carregando usuários...</p>";

    const searchTerm = document.getElementById("blockSearch")?.value.trim().toLowerCase() || "";

    firebase.database().ref("users").once("value")
        .then(snapshot => {
            blockList.innerHTML = ""; // limpa antes de popular

            snapshot.forEach(childSnap => {
                const user = childSnap.val();
                const uid = childSnap.key;

                // Ignora admins
                if (user.role === "admin") return;

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
                if (user.able === false) {
                    actionBtn = document.createElement("button");
                    actionBtn.textContent = "Desbloquear";
                    actionBtn.className = "primary";
                    actionBtn.onclick = () => unblockUser(uid);
                } else {
                    actionBtn = document.createElement("button");
                    actionBtn.textContent = "Bloquear";
                    actionBtn.className = "danger";
                    actionBtn.onclick = () => blockUser(uid);
                }

                row.appendChild(actionBtn);
                userCard.appendChild(row);
                blockList.appendChild(userCard);
            });

            // Caso não encontre nenhum usuário
            if (blockList.innerHTML === "") {
                blockList.innerHTML = "<p>Nenhum usuário encontrado.</p>";
            }
        })
        .catch(err => console.error("Erro ao carregar usuários para bloqueio:", err));
}

// função para bloquear usuário
function blockUser(uid) {
    firebase.database().ref("users/" + uid).update({ able: false })
        .then(() => {
            alert("Usuário bloqueado com sucesso!");
            loadBlockManager();
        })
        .catch(err => {
            console.error("Erro ao bloquear usuário:", err);
            alert("Erro ao bloquear usuário. Verifique permissões.");
        });
}

// função para desbloquear usuário
function unblockUser(uid) {
    firebase.database().ref("users/" + uid).update({ able: true })
        .then(() => {
            alert("Usuário desbloqueado com sucesso!");
            loadBlockManager();
        })
        .catch(err => {
            console.error("Erro ao desbloquear usuário:", err);
            alert("Erro ao desbloquear usuário. Verifique permissões.");
        });
}
