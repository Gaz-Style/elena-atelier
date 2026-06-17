const WHATSAPP_API_TOKEN = 'EAADl86TwXLEBRid2zcdl2GwJtA7uZBmhGcZASXLcEK3mY4C8cnBOu9PEZCdYfD0nQVsZCZCWS6pebEvlZBHBZB7AtMdYdF0nRXUxnAJ5br7QgqaUyc2TeeaTfNnUsjyur0Jm18D9imQgSINbmh6U3ebJbdolZAUOAfFCGGR7UES9GhZBm0igTHZC2By8p63b2B1wZDZD';
const WHATSAPP_PHONE_NUMBER_ID = '1130018670196966';
const numero = '56984021940';

fetch('https://graph.facebook.com/v21.0/' + WHATSAPP_PHONE_NUMBER_ID + '/messages', {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer ' + WHATSAPP_API_TOKEN,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: numero,
        type: 'template',
        template: {
            name: 'alerta_pos',
            language: { code: 'es_CL' },
            components: [{
                type: 'body',
                parameters: [
                    { type: 'text', text: 'Panel Admin' },
                    { type: 'text', text: 'Eliminar Venta' },
                    { type: 'text', text: '100%' },
                    { type: 'text', text: '' },
                    { type: 'text', text: '1234 Confirmar' }
                ]
            }]
        }
    })
}).then(res => res.json()).then(console.log).catch(console.error);
