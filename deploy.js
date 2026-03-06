const { execSync } = require('child_process');
const fs = require('fs');

try {
    const mineCode = fs.readFileSync('server/src/controllers/mine.controller.ts', 'utf8');
    const antiCheatCode = fs.readFileSync('server/src/middlewares/antiCheat.middleware.ts', 'utf8');

    const mineBase64 = Buffer.from(mineCode).toString('base64');
    const antiCheatBase64 = Buffer.from(antiCheatCode).toString('base64');

    const sshCommand = `ssh -i "C:\\d\\cologi2025@outlook.com.pem" -o StrictHostKeyChecking=no ubuntu@3.0.48.97 "echo ${mineBase64} | base64 --decode > ~/maxminer_production/server/src/controllers/mine.controller.ts && echo ${antiCheatBase64} | base64 --decode > ~/maxminer_production/server/src/middlewares/antiCheat.middleware.ts && cd ~/maxminer_production/server && npm run build && pm2 restart maxminer-api"`;

    console.log("Executing remote deployment...");
    const stdout = execSync(sshCommand, { encoding: 'utf8' });
    console.log("Success:\n", stdout);

} catch (error) {
    console.error("Deploy Error:", error.message);
    if (error.stdout) console.log("STDOUT:", error.stdout);
    if (error.stderr) console.error("STDERR:", error.stderr);
}
