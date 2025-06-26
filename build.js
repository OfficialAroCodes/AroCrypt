import { build, Platform, Arch } from "electron-builder";
import fs from "fs/promises";
import dotenv from "dotenv";
import path from "path";
import os from "os";

dotenv.config();

async function main() {
  const platform = os.platform();
  const isWSL = await fs
    .readFile("/proc/version", "utf8")
    .then((content) => content.toLowerCase().includes("microsoft"))
    .catch(() => false);
  const cwd = process.cwd();

  const isPathOnWindows = cwd.startsWith("/mnt/c/");

  if (isPathOnWindows && platform === "linux") {
    console.log(
      "⚠️ You're running the build inside WSL but on a Windows filesystem path."
    );
    console.log(
      "❌ Cannot build for Linux using Windows paths. Move your project to the Linux filesystem (/home)!"
    );
    process.exit(1);
  }

  const certPassword = process.env.CERT_PASSWORD?.trim() || "";
  const rawConfig = await fs.readFile("./electron-builder.json", "utf-8");
  const config = JSON.parse(rawConfig);

  if (config.win && certPassword) {
    config.win.cscKeyPassword = certPassword;
  }

  const tempConfigPath = path.join(process.cwd(), "temp-electron-builder.json");
  await fs.writeFile(tempConfigPath, JSON.stringify(config, null, 2));

  try {
    if (isWSL) {
      console.log(
        "Detected WSL. Building for Linux (no Windows builds inside WSL)."
      );
      await build({
        config: tempConfigPath,
        targets: new Map([
          [
            Platform.LINUX,
            new Map([
              [Arch.x64, ["deb", "AppImage"]],
              [Arch.ia32, ["deb", "AppImage"]],
            ]),
          ],
        ]),
      });
    } else if (platform === "linux") {
      console.log("Running on native Linux. Building for Linux...");
      await build({
        config: tempConfigPath,
        targets: new Map([
          [
            Platform.LINUX,
            new Map([
              [Arch.x64, ["deb", "AppImage"]],
            ]),
          ],
        ]),
      });
    } else if (platform === "win32") {
      console.log("Running on Windows. Building for Windows...");
      await build({
        config: tempConfigPath,
        targets: new Map([
          [
            Platform.WINDOWS,
            new Map([
              [Arch.x64, ["nsis", "portable"]],
              [Arch.ia32, ["nsis", "portable"]],
            ]),
          ],
        ]),
      });
    } else if (platform === "darwin") {
      console.log("Running on macOS. Building for macOS...");
      await build({
        config: tempConfigPath,
        targets: new Map([
          [
            Platform.MAC,
            new Map([
              [Arch.x64, ["dmg"]],
              [Arch.arm64, ["dmg"]],
            ]),
          ],
        ]),
      });
    } else {
      console.error("Unsupported platform:", platform);
      process.exit(1);
    }

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
