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

function brDateTimeToInputDate(brDateTimeStr) {
    // Exemplo esperado: "24/07/2025, 09:36:00"
    if (!brDateTimeStr) {
        console.error('brDateTimeToInputDate: valor indefinido ou vazio');
        return '';
    }

    var parts = brDateTimeStr.split(',');  // separa na vírgula
    if (parts.length < 1) {
        console.error('Formato inválido:', brDateTimeStr);
        return '';
    }

    var datePart = parts[0].trim();  // remove espaços
    var dateParts = datePart.split('/');
    if (dateParts.length !== 3) {
        console.error('Data mal formatada:', datePart);
        return '';
    }

    var [day, month, year] = dateParts;

    if (!day || !month || !year) {
        console.error('Componentes de data ausentes:', { day, month, year });
        return '';
    }

    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}