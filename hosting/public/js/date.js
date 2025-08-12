// Converte qualquer data para o horário de Brasília e formata
function brDate(date) {
    const dateObj = new Date(date);
    if (isNaN(dateObj)) return 'Data inválida';
    return dateObj.toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        hour12: false
    });
}

// Converte data BR para formato yyyy-mm-dd (para input type="date")
function formattedDate(date) {
    const dateObj = new Date(date);
    if (isNaN(dateObj)) return 'Data inválida';
    return dateObj.toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        hour12: false
    });
}