const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const {
  TwaManifest,
  TwaGenerator,
  KeyTool,
  JdkHelper,
  Config,
  ConsoleLog,
  BufferedLog,
} = require("@bubblewrap/core");

const MANIFEST_URL = "https://unbind.jaehun0104.workers.dev/manifest.json";
const TARGET_DIR = __dirname;

function randomPassword() {
  return crypto.randomBytes(18).toString("base64").replace(/[^a-zA-Z0-9]/g, "").slice(0, 20);
}

async function main() {
  const twaManifest = await TwaManifest.fromWebManifest(MANIFEST_URL);

  twaManifest.packageId = "dev.jaehun0104.unbind";
  twaManifest.appVersionCode = 1;
  twaManifest.appVersion = "1.0.0";
  twaManifest.signingKey.path = path.join(TARGET_DIR, "android.keystore");
  twaManifest.signingKey.alias = "unbind";

  const error = twaManifest.validate();
  if (error) {
    throw new Error("twaManifest invalid: " + error);
  }

  await twaManifest.saveToFile(path.join(TARGET_DIR, "twa-manifest.json"));

  const twaGenerator = new TwaGenerator();
  const log = new BufferedLog(new ConsoleLog("Generating TWA"));
  await twaGenerator.createTwaProject(TARGET_DIR, twaManifest, log, () => {});
  log.flush();

  // Checksum file (mirrors bubblewrap CLI behavior, used by `bubblewrap update`)
  const manifestContents = fs.readFileSync(path.join(TARGET_DIR, "twa-manifest.json"));
  const sum = crypto.createHash("sha1").update(manifestContents).digest("hex");
  fs.writeFileSync(path.join(TARGET_DIR, "manifest-checksum.txt"), sum);

  // Signing key
  const config = await Config.loadConfig(path.join(require("os").homedir(), ".bubblewrap", "config.json"));
  const jdkHelper = new JdkHelper(process, config);
  const keytool = new KeyTool(jdkHelper);

  const keystorePassword = randomPassword();
  const keyPassword = randomPassword();

  await keytool.createSigningKey({
    fullName: "Unbind",
    organizationalUnit: "Unbind",
    organization: "Unbind",
    country: "KR",
    password: keystorePassword,
    keypassword: keyPassword,
    alias: twaManifest.signingKey.alias,
    path: twaManifest.signingKey.path,
  });

  fs.writeFileSync(
    path.join(TARGET_DIR, "KEYSTORE_SECRETS.local.txt"),
    `절대 커밋/공유 금지 - 이 파일은 .gitignore에 있음\n\n` +
    `keystore path: ${twaManifest.signingKey.path}\n` +
    `alias: ${twaManifest.signingKey.alias}\n` +
    `keystore password: ${keystorePassword}\n` +
    `key password: ${keyPassword}\n` +
    `packageId: ${twaManifest.packageId}\n`
  );

  console.log("DONE");
  console.log("packageId:", twaManifest.packageId);
  console.log("keystore:", twaManifest.signingKey.path);
}

main().catch((e) => {
  console.error("FAILED", e);
  process.exit(1);
});
