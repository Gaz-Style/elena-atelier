require('dotenv').config({ path: '.env.local' });
const nodemailer = require('nodemailer');

const htmlContent = `
<h2>📊 Reporte de Análisis Web: Elena Atelier (Hoy)</h2>
<p>Estimado/a equipo,</p>
<p>Aquí tienes el análisis en tiempo real de Google Analytics 4 (GA4) ajustado estrictamente <strong>solo para el día de hoy</strong> (las últimas 24 horas) y <strong>excluyendo todo el tráfico interno de las páginas /admin</strong>.</p>

<h3>📱 1. Volumen de Tráfico Público y Dispositivos (Hoy)</h3>
<ul>
<li><strong>Teléfonos Móviles (Smartphones):</strong> 9 usuarias (16 sesiones de navegación).</li>
<li><strong>Computadores (Desktop):</strong> 6 usuarias (15 sesiones).</li>
<li><strong>Tablets:</strong> 0 usuarias.</li>
</ul>
<p><em>Dato clave:</em> El <strong>60% del público hoy entró desde el celular</strong>, reafirmando que nuestra optimización <em>Mobile-First</em> está impactando exactamente donde están las clientas.</p>

<h3>📄 2. Top Páginas y Servicios Más Buscados (Hoy)</h3>
<ol>
<li><strong>La Portada Principal (/)</strong>
    <ul>
    <li><strong>14 Vistas (aprox. 8 usuarias).</strong></li>
    <li>Retención altísima: Se quedaron en promedio más de <strong>7 minutos (429 segundos)</strong>. Tasa de rebote: 0%.</li>
    </ul>
</li>
<li><strong>El Estudio de Diseño con IA (/estudio-ia)</strong>
    <ul>
    <li><strong>11 Vistas (4 usuarias).</strong></li>
    <li>Muy alto interés en el nuevo servicio. Pasaron en promedio <strong>más de 10 minutos</strong> jugando y cotizando diseños.</li>
    </ul>
</li>
<li><strong>Vestidos de Graduación (/graduacion/registro-exclusividad y comunas)</strong>
    <ul>
    <li><strong>5 Vistas.</strong></li>
    <li>Búsquedas locales en Las Condes y Providencia. En la página de <strong>Registro de Exclusividad</strong> una usuaria pasó <strong>más de 20 minutos (1246 segundos)</strong>, probablemente llenando el formulario con mucha atención.</li>
    </ul>
</li>
<li><strong>Arreglos y Costuras a Domicilio (Sector Oriente)</strong>
    <ul>
    <li><strong>1 visita para La Dehesa (/costuras/la-dehesa)</strong>: Se quedó <strong>8 minutos</strong> leyendo.</li>
    <li><strong>1 visita para Lo Barnechea (/costuras/lo-barnechea)</strong>: Se quedó <strong>5 minutos</strong> leyendo.</li>
    </ul>
</li>
<li><strong>Cursos de Costura (/cursos)</strong>
    <ul>
    <li><strong>1 visita.</strong> Fue rápida (21 segundos).</li>
    </ul>
</li>
</ol>

<h3>💡 3. Conclusión Estratégica del Día</h3>
<p>Hoy ha sido un día de <strong>tráfico de altísima calidad ("Warm Leads")</strong>. A diferencia de otros días donde la gente entra y se va a los 40 segundos, <strong>las clientas de hoy pasaron entre 5 y 20 minutos leyendo tu web</strong>. Esto significa que las personas que están llegando a las landing pages locales y al Estudio IA están verdaderamente interesadas y enganchadas con la propuesta de "Alta Costura y Tecnología".</p>
<p><em>Enviado automáticamente por el Sistema de Inteligencia Omnicanal de Elena Atelier.</em></p>
`;

async function sendEmail() {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });

  try {
    const info = await transporter.sendMail({
      from: '"Elena Atelier Analytics" <' + process.env.SMTP_USER + '>',
      to: 'mcruz1232@gmail.com',
      subject: '📊 Reporte de Análisis Web Diario - Elena Atelier',
      html: htmlContent
    });
    console.log('Mensaje enviado con éxito: %s', info.messageId);
  } catch (error) {
    console.error('Error enviando el correo:', error);
  }
}

sendEmail();
