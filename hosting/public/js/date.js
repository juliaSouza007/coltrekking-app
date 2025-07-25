function horarioBrasilia() {
    var now = new Date();
    
    // Cria uma nova data corrigida para UTC-3
    var utcOffsetInMinutes = 180; // UTC-3 = 180 minutos
    var brazilDate = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) - (utcOffsetInMinutes * 60000));

    // Formato: 24/07/2025 09:36:00
    var formatted = brazilDate.toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        hour12: false
    });

    return formatted;
}

function formattedDate(date) {
    const dateObj = new Date(date);
    if (isNaN(dateObj)) return 'Data inválida';

    var formatted = dateObj.toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        hour12: false
    });
    
    // Formato: 24/07/2025 09:36:00
    return formatted;
}

function parseDateBr(dateStr) {
    // Exemplo: "29/06/2025, 20:20:00"
    var parts = dateStr.split(', ');
    var dateParts = parts[0].split('/');
    var timeParts = parts[1].split(':');

    var day = parseInt(dateParts[0], 10);
    var month = parseInt(dateParts[1], 10) - 1; // mês começa do zero
    var year = parseInt(dateParts[2], 10);

    var hour = parseInt(timeParts[0], 10);
    var minute = parseInt(timeParts[1], 10);
    var second = parseInt(timeParts[2], 10);

    return new Date(year, month, day, hour, minute, second).getTime();
}
