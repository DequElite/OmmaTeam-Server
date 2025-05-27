export default function inviteEmail(
  inviteLink: string,
  inviterName: string,
  teamName: string,
) {
  return `
    <!DOCTYPE html>
<html lang="en" style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
<head>
  <meta charset="UTF-8">
  <title>You're Invited to Join ${teamName}</title>
</head>
<body style="background-color: #f4f4f4; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding: 30px 0;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          <tr>
            <td align="center" style="padding: 40px 20px 20px;">
              <h1 style="color: #333;">Welcome to ${teamName}!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 30px 30px; color: #555; font-size: 16px;">
              <p>Hey future teammate 👋</p>
              <p><strong>${inviterName}</strong> has invited you to join the <strong>${teamName}</strong> team on OmmaTeam — a place where productivity meets style 😎</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${inviteLink}" 
                  style="background: linear-gradient(45deg, #9C5FD2, #F15D33);
                         color: white; 
                         padding: 14px 24px; 
                         text-decoration: none; 
                         font-size: 18px; 
                         border-radius: 5px; 
                         display: inline-block;">
                  Join Team
                </a>
              </div>
              <p>If you weren’t expecting this invite — no worries, you can safely ignore it. Nothing will be changed.</p>
              <p style="margin-top: 40px;">See you inside!<br>The OmmaTeam app, powered by DequElite 💪</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="background-color: #f4f4f4; padding: 20px; font-size: 12px; color: #aaa;">
              &copy; 2025 DequElite OmmaTeam. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}
