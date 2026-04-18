import { execSync } from "child_process";

module.exports = async function () {
  const port = process.env.PORT ? Number(process.env.PORT) : 3000;

  try {
    const pid = execSync(`lsof -ti :${port}`, { encoding: "utf-8" }).trim();
    if (pid) {
      process.kill(Number(pid), "SIGTERM");
    }
  } catch {}

  console.log(globalThis.__TEARDOWN_MESSAGE__);
};
