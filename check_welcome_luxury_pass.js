const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

const getTransporter = () => {
    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
        }
    });
};

const emailLogoHtml = `
  <div style="text-align: center; margin-bottom: 20px;">
    <span style="font-family: 'Playfair Display', Georgia, serif; font-size: 26px; font-weight: bold; color: #C17F5F; letter-spacing: 2px;">ELENA</span>
    <div style="font-size: 9px; text-transform: uppercase; color: #A39E93; letter-spacing: 3px; margin-top: 5px; font-weight: 600;">ATELIER</div>
  </div>
`;

async function testSendWelcomeMail() {
    console.log("=== ENVIANDO TICKET DE BIENVENIDA (LUXURY PASS) DE NOVIA ===");
    
    const customerEmail = "mcruz1232@gmail.com";
    const customerName = "Marisol Rojas";
    const portalLink = "https://elenalacosturera.cl/portal-novias/demo-id";

    // Cargar la imagen de fondo de novia si existe
    const attachments = [];
    let cardBgUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAGUlEQVR4nO3BMQEAAADCoPVPbQ0PoAAAAAAAAAAA8F8bGgABxZqVdgAAAABJRU5ErkJggg==';
    const filePath = path.join(process.cwd(), 'public', 'trabajos', 'novia_2.jpeg');
    const alternativeFilePath = path.join(process.cwd(), 'public', 'trabajos', 'novia 2.jpeg');
    
    let pathFound = "";
    if (fs.existsSync(filePath)) {
        pathFound = filePath;
    } else if (fs.existsSync(alternativeFilePath)) {
        pathFound = alternativeFilePath;
    }

    if (pathFound) {
        attachments.push({ filename: 'novia_2.jpeg', path: pathFound, cid: 'luxuryPassBg' });
        cardBgUrl = 'cid:luxuryPassBg';
        console.log("✓ Imagen de novia cargada como attachment.");
    } else {
        console.log("⚠️ No se encontró la imagen de fondo, se usará fallback.");
    }

    const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8" />
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;600&display=swap');
</style>
</head>
<body style="margin: 0; padding: 0; background-color: #0A0A0A; font-family: 'Inter', Helvetica, sans-serif;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #0A0A0A; padding: 40px 20px;">
    <tr>
      <td align="center">
        
        <!-- Advanced Inset Border Container -->
        <table width="380" border="0" cellpadding="0" cellspacing="0" style="box-shadow: 0 25px 50px rgba(0,0,0,0.08);">
          
          <!-- TOP SECTION (Background Image + Gradient) -->
          <tr>
            <td background="${cardBgUrl}" bgcolor="#F5F5F0" style="background: linear-gradient(rgba(252, 250, 247, 0.50), rgba(252, 250, 247, 0.50)), url('${cardBgUrl}') left top no-repeat; background-image: linear-gradient(rgba(252, 250, 247, 0.50), rgba(252, 250, 247, 0.50)), url('${cardBgUrl}'); background-size: 100% 100%; background-position: left top; background-repeat: no-repeat;">
              
              <table width="100%" border="0" cellpadding="0" cellspacing="0">
                <!-- Top inset margin -->
                <tr><td height="15" colspan="3"></td></tr>
                
                <!-- Main content row with side insets -->
                <tr>
                  <td width="15"></td>
                  <!-- Softer inset border -->
                  <td style="border-top: 1px solid rgba(193,127,95,0.3); border-left: 1px solid rgba(193,127,95,0.3); border-right: 1px solid rgba(193,127,95,0.3); padding: 40px 10px;">
                    
                    <!-- Text Container (center aligned within left column) -->
                    <table width="100%" border="0" cellpadding="0" cellspacing="0" align="center">
                      <tr>
                        <td align="center" style="text-align: center;">
                          <!-- Logo -->
                          ${emailLogoHtml}
                          
                          <!-- Subtle logo divider -->
                          <table width="60" border="0" cellpadding="0" cellspacing="0" align="center" style="margin: 20px auto 20px auto;">
                            <tr>
                              <td width="22" valign="middle" style="vertical-align: middle; line-height: 0; font-size: 0;"><div style="height: 1px; background: rgba(193,127,95,0.4); background: linear-gradient(to left, rgba(193,127,95,0.4) 0%, transparent 100%); font-size: 0; line-height: 0; width: 100%;"></div></td>
                              <td width="16" align="center" valign="middle" style="font-size: 10px; color: rgba(193,127,95,0.7); padding: 0 4px; line-height: 1; vertical-align: middle;">&#x2726;</td>
                              <td width="22" valign="middle" style="vertical-align: middle; line-height: 0; font-size: 0;"><div style="height: 1px; background: rgba(193,127,95,0.4); background: linear-gradient(to right, rgba(193,127,95,0.4) 0%, transparent 100%); font-size: 0; line-height: 0; width: 100%;"></div></td>
                            </tr>
                          </table>
                          
                          <p style="color: #C17F5F; font-size: 8px; text-transform: uppercase; letter-spacing: 4px; margin: 0 0 25px 0; font-weight: 600;">
                            ACCESO PORTAL PRIVADO
                          </p>
                          
                          <p style="font-family: 'Inter', Helvetica, sans-serif; color: #6B6660; font-size: 9px; text-transform: uppercase; letter-spacing: 3px; margin: 0 0 5px 0; font-weight: 400;">
                            BIENVENIDA
                          </p>
                          
                          <p style="font-family: 'Playfair Display', Georgia, serif; color: #1A1A1A; font-size: 32px; margin: 0 0 15px 0; font-style: italic; font-weight: 400;">
                            ${customerName}
                          </p>
                          
                          <!-- Gold divider line with subtle center shape and softer lines -->
                          <table width="160" border="0" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto 25px auto;">
                            <tr>
                              <td width="70" valign="middle" style="vertical-align: middle; line-height: 0; font-size: 0;"><div style="height: 1px; background: rgba(193,127,95,0.4); background: linear-gradient(to left, rgba(193,127,95,0.4) 0%, transparent 100%); font-size: 0; line-height: 0; width: 100%;"></div></td>
                              <td width="20" align="center" valign="middle" style="font-size: 10px; color: rgba(193,127,95,0.7); padding: 0 4px; line-height: 1; vertical-align: middle;">&#x2726;</td>
                              <td width="70" valign="middle" style="vertical-align: middle; line-height: 0; font-size: 0;"><div style="height: 1px; background: rgba(193,127,95,0.4); background: linear-gradient(to right, rgba(193,127,95,0.4) 0%, transparent 100%); font-size: 0; line-height: 0; width: 100%;"></div></td>
                            </tr>
                          </table>
                          
                          <p style="color: #4A4A4A; font-size: 11px; line-height: 1.8; margin: 0 auto 25px auto; font-weight: 300; max-width: 260px;">
                            Es un privilegio acompañarte en este proceso.<br>Te invitamos a vivir la experiencia<br>Elena Atelier.
                          </p>
                          
                          <!-- Centered Button -->
                          <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                            <tr>
                              <td align="center">
                                <a href="${portalLink}" target="_blank" style="font-size: 11px; font-family: 'Inter', Helvetica, sans-serif; font-weight: 600; color: #C17F5F; background-color: #F5ECE3; text-decoration: none; padding: 12px 30px; border: 1px solid rgba(193,127,95,0.4); display: inline-block; text-transform: uppercase; letter-spacing: 3px;">
                                  INGRESAR AL PORTAL
                                </a>
                              </td>
                            </tr>
                          </table>
                          
                          <div style="margin-top: 45px;"></div>
                          
                          <!-- Footer signature -->
                          <table width="240" border="0" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto; border-top: 1px solid rgba(0,0,0,0.05); padding-top: 20px;">
                            <tr>
                              <td align="right" style="padding-right: 15px; border-right: 1px solid rgba(193,127,95,0.25); vertical-align: middle;">
                                <span style="font-family:'Playfair Display', Georgia, serif; font-size: 26px; color: #C17F5F; letter-spacing: 1px;">E</span>
                              </td>
                              <td align="left" style="padding-left: 15px; vertical-align: middle;">
                                <p style="font-family: 'Inter', Helvetica, sans-serif; color: #1A1A1A; font-size: 9px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 3px 0;">
                                  ELENA ATELIER
                                </p>
                                <p style="font-family: 'Inter', Helvetica, sans-serif; color: #8B8680; font-size: 7px; letter-spacing: 1px; text-transform: uppercase; margin: 0;">
                                  ATELIER &middot; SANTIAGO DE CHILE
                                </p>
                              </td>
                            </tr>
                          </table>
                          
                        </td>
                      </tr>
                    </table>
                    
                  </td>
                  <td width="15"></td>
                </tr>
              </table>
              
            </td>
          </tr>
          
          <!-- BOTTOM SECTION (Black Footer) -->
          <tr>
            <td bgcolor="#1A1A1A">
              <table width="100%" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="15"></td>
                  <!-- The Frame Container -->
                  <td style="padding: 0;">
                    
                    <table width="100%" border="0" cellpadding="0" cellspacing="0">
                      <!-- 1. Vertical borders continuing into the black area -->
                      <tr>
                        <td style="border-left: 1px solid rgba(193,127,95,0.4); border-right: 1px solid rgba(193,127,95,0.4);">
                           <table width="100%" border="0" cellpadding="0" cellspacing="0"><tr><td height="12" style="font-size:0; line-height:0;">&nbsp;</td></tr></table>
                        </td>
                      </tr>
                      
                      <!-- 2. The broken bottom border, perfect corners, and floating content in the gap -->
                      <tr>
                        <td style="padding: 0;">
                          <table width="100%" border="0" cellpadding="0" cellspacing="0">
                            <tr>
                              <!-- Left corner and left segment of main bottom line -->
                              <td valign="bottom" style="border-left: 1px solid rgba(193,127,95,0.4); font-size: 0; line-height: 0; padding: 0;">
                                <div style="height: 1px; background: rgba(193,127,95,0.4); background: linear-gradient(to right, rgba(193,127,95,0.4) 0%, transparent 100%); width: 100%;"></div>
                              </td>
                              
                              <!-- Central gap layout -->
                              <td width="290" align="center" valign="bottom" style="padding-bottom: 0px;">
                                 
                                 <table width="240" border="0" cellpadding="0" cellspacing="0" align="center" style="margin-bottom: 12px;">
                                   <tr>
                                     <td width="105" valign="middle"><div style="height: 1px; background: rgba(193,127,95,0.3); background: linear-gradient(to left, rgba(193,127,95,0.3) 0%, transparent 100%); font-size: 0; line-height: 0; width: 100%;"></div></td>
                                     <td width="30" align="center" valign="middle" style="font-size: 11px; color: rgba(193,127,95,0.8); line-height: 1;">&#9825;</td>
                                     <td width="105" valign="middle"><div style="height: 1px; background: rgba(193,127,95,0.3); background: linear-gradient(to right, rgba(193,127,95,0.3) 0%, transparent 100%); font-size: 0; line-height: 0; width: 100%;"></div></td>
                                   </tr>
                                 </table>
                                 
                                 <div style="position: relative; top: 3px;">
                                   <p style="font-family: 'Inter', Helvetica, sans-serif; color: #8B8680; font-size: 7px; letter-spacing: 2px; text-transform: uppercase; margin: 0; line-height: 1;">
                                     &copy; ${new Date().getFullYear()} ELENA ATELIER - DERECHOS RESERVADOS
                                   </p>
                                 </div>
                              </td>
                              
                              <!-- Right corner and right segment of main bottom line -->
                              <td valign="bottom" style="border-right: 1px solid rgba(193,127,95,0.4); font-size: 0; line-height: 0; padding: 0;">
                                <div style="height: 1px; background: rgba(193,127,95,0.4); background: linear-gradient(to left, rgba(193,127,95,0.4) 0%, transparent 100%); width: 100%;"></div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
 
                  </td>
                  <td width="15"></td>
                </tr>
                <!-- Spacer below the frame -->
                <tr><td height="25" colspan="3"></td></tr>
              </table>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const transporter = getTransporter();
    try {
        await transporter.sendMail({
            from: '"Elena Atelier" <contacto@elenalacosturera.cl>',
            to: customerEmail,
            subject: `Acceso a tu Portal - ${customerName}`,
            text: `Te damos la bienvenida, ${customerName},\n\nEs un privilegio acompañarte en este proceso. Te invitamos a vivir la experiencia Elena Atelier.\n\nPuedes ingresar a tu portal privado en el siguiente enlace:\n${portalLink}\n\nAtentamente,\nElena Atelier`,
            html: htmlContent,
            attachments
        });
        console.log("✓ Luxury Pass enviado exitosamente a mcruz1232@gmail.com");
    } catch (e) {
        console.error("Fallo al enviar el Luxury Pass:", e);
    }
}

testSendWelcomeMail();
