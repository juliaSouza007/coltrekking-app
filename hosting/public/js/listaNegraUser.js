// função para verificar status de bloqueio do usuário
function showBlockStatus() {
    const container = document.getElementById("userBlockStatus");
    container.innerHTML = "Verificando status...";

    const user = firebase.auth().currentUser;
    if (!user) {
        container.innerHTML = "Você precisa estar logado.";
        return;
    }

    firebase.database().ref("users/" + user.uid).once("value")
        .then(snapshot => {
            const data = snapshot.val();
            container.innerHTML = data && data.able === false
                ? "Você está bloqueado de se inscrever em eventos"
                : "Você pode se inscrever em eventos";
        })
        .catch(() => {
            container.innerHTML = "Erro ao verificar status.";
        });
}
