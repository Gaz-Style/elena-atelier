/**
 * Utilitario para manejo preciso de la zona horaria 'America/Santiago' (Chile).
 * Chile cambia entre UTC-4 (Horario de Invierno) y UTC-3 (Horario de Verano).
 */

/**
 * Convierte una fecha (YYYY-MM-DD) y hora (HH:mm o HH:mm:ss) expresadas en hora local de Santiago de Chile
 * a su equivalente exacto en cadena ISO UTC (por ejemplo, "2026-09-09T20:00:00.000Z").
 */
export function toSantiagoISO(dateStr: string, timeStr: string = '00:00:00'): string {
    const cleanTime = timeStr.length === 5 ? `${timeStr}:00` : timeStr;
    const targetLocalStr = `${dateStr}T${cleanTime}`;

    // Probar primero offsets estándar (-03:00 para verano, -04:00 para invierno)
    const tryOffsets = ['-03:00', '-04:00'];
    for (const offset of tryOffsets) {
        const candidateDate = new Date(`${targetLocalStr}${offset}`);
        if (isNaN(candidateDate.getTime())) continue;

        const formatter = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'America/Santiago',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });

        const parts = formatter.formatToParts(candidateDate);
        const y = parts.find(p => p.type === 'year')?.value;
        const m = parts.find(p => p.type === 'month')?.value;
        const d = parts.find(p => p.type === 'day')?.value;
        let h = parts.find(p => p.type === 'hour')?.value || '00';
        if (h === '24') h = '00';
        const min = parts.find(p => p.type === 'minute')?.value || '00';
        const sec = parts.find(p => p.type === 'second')?.value || '00';

        const formattedLocalStr = `${y}-${m}-${d}T${h}:${min}:${sec}`;

        if (formattedLocalStr === targetLocalStr) {
            return candidateDate.toISOString();
        }
    }

    // Fallback: usar evaluación mediante Intl timeZoneName
    const pivot = new Date(`${dateStr}T12:00:00Z`);
    const tzFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Santiago',
        timeZoneName: 'shortOffset'
    });
    const parts = tzFormatter.formatToParts(pivot);
    const tzName = parts.find(p => p.type === 'timeZoneName')?.value || '';
    const fallbackOffset = tzName.includes('-3') ? '-03:00' : '-04:00';
    return new Date(`${targetLocalStr}${fallbackOffset}`).toISOString();
}

/**
 * Retorna un objeto Date creado a partir de la hora local de Santiago.
 */
export function parseSantiagoDate(dateStr: string, timeStr: string = '00:00:00'): Date {
    return new Date(toSantiagoISO(dateStr, timeStr));
}

/**
 * Retorna los rangos ISO de inicio (00:00:00) y fin (23:59:59) para una fecha en hora local de Santiago.
 */
export function getSantiagoDayBounds(dateStr: string): { startISO: string; endISO: string } {
    return {
        startISO: toSantiagoISO(dateStr, '00:00:00'),
        endISO: toSantiagoISO(dateStr, '23:59:59')
    };
}
