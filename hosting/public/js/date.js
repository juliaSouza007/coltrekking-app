// Converte data BR para formato yyyy-mm-dd (para input type="date")
function formattedDate(date) {
    const dateObj = new Date(date);
    if (isNaN(dateObj)) return 'Data inválida';
    return dateObj.toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        hour12: false
    });
}

function formatDateToISOTruncated(date = new Date()) {
  const offsetMs = date.getTimezoneOffset() * 60000; // diferença local ↔ UTC em ms
  const localISOTime = new Date(date - offsetMs).toISOString().slice(0, 16);
  return localISOTime;
}
