import { execSync } from "child_process";
/* eslint-disable */

module.exports = async function () {
  // Put clean up logic here (e.g. stopping services, docker-compose, etc.).
  // Hint: `globalThis` is shared between setup and teardown.
  const port = process.env.PORT ? Number(process.env.PORT) : 3000;

  try {
    const pid = execSync(`lsof -ti :${port}`, { encoding: "utf-8" }).trim();
    if (pid) {
      process.kill(Number(pid), "SIGTERM");
    }
  } catch {}

  console.log(globalThis.__TEARDOWN_MESSAGE__);
};
