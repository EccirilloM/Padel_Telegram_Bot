// Funzione per verificare se il messaggio è di tipo testo
export function isTextMessage(message: any): message is { text: string } {
    return message && typeof message.text === 'string';
  }