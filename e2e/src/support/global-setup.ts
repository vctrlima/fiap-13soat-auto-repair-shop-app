import * as net from "net";

function waitForPortOpen(
  port: number,
  options: { host?: string; timeout?: number } = {},
): Promise<void> {
  const { host = "localhost", timeout = 30000 } = options;
  const start = Date.now();

  return new Promise((resolve, reject) => {
    const tryConnect = () => {
      const socket = net.createConnection({ port, host }, () => {
        socket.destroy();
        resolve();
      });

      socket.on("error", () => {
        socket.destroy();
        if (Date.now() - start >= timeout) {
          reject(new Error(`Timeout waiting for port ${port} on ${host}`));
        } else {
          setTimeout(tryConnect, 500);
        }
      });
    };

    tryConnect();
  });
}

/* eslint-disable */
var __TEARDOWN_MESSAGE__: string;

module.exports = async function () {
  // Start services that that the app needs to run (e.g. database, docker-compose, etc.).
  console.log("\nSetting up...\n");

  const host = process.env.HOST ?? "localhost";
  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await waitForPortOpen(port, { host });

  // Hint: Use `globalThis` to pass variables to global teardown.
  globalThis.__TEARDOWN_MESSAGE__ = "\nTearing down...\n";
};
