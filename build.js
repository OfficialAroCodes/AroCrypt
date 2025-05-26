/* 
This file facilitates the secure loading of environment variables from the .env file into the Electron app.
Ensuring that sensitive information such as API keys, secrets, and passwords remain protected.
*/

import { build } from "electron-builder";
import fs from "fs/promises";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

async function main() {
  const certPassword = process.env.CERT_PASSWORD.trim();
  const rawConfig = await fs.readFile("./electron-builder.json", "utf-8");
  const config = JSON.parse(rawConfig);

  if (config.win && certPassword) {
    config.win.certificatePassword = certPassword;
  }

  const tempConfigPath = path.join(process.cwd(), "temp-electron-builder.json");
  await fs.writeFile(tempConfigPath, JSON.stringify(config, null, 2));

  try {
    console.log("Building with certificate password...");
    await build({ config: tempConfigPath });
    console.log("Build succeeded!");
  } catch (err) {
    console.error("Build failed:", err);
    process.exit(1);
  } finally {
    try {
      await fs.unlink(tempConfigPath);
    } catch (cleanupErr) {
      console.warn("Failed to clean up temporary config file:", cleanupErr);
    }
  }
}

main();
