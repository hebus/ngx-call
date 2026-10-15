// Publishes the `ngx-call` library: pre-flight → build → npm publish (2FA/OTP)
// → wait for the registry → git tag → GitHub Release. The version itself is
// bumped beforehand by the Changesets "version packages" PR — never here.
//
// Usage: npm run release -- [--userconfig <.npmrc>] [--otp <code>] [--dry-run] [--yes]
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { createInterface } from "node:readline/promises";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const PKG = "ngx-call";
const REPO = "hebus/ngx-call";

const { values: opts } = parseArgs({
  options: {
    userconfig: { type: "string" },
    otp: { type: "string" },
    "dry-run": { type: "boolean", default: false },
    yes: { type: "boolean", default: false },
  },
});
const dryRun = opts["dry-run"];
const npmAuth = opts.userconfig ? ["--userconfig", opts.userconfig] : [];

const log = msg => console.log(`[release] ${msg}`);
const die = msg => {
  console.error(`[release] ✖ ${msg}`);
  process.exit(1);
};
// In dry-run, blocking checks about an already-released version only warn.
const guard = (ok, msg) => {
  if (ok) return;
  if (dryRun) log(`⚠ ${msg} (ignoré en --dry-run)`);
  else die(msg);
};

function run(cmd, args, { capture = true } = {}) {
  const res = spawnSync(cmd, args, {
    cwd: root,
    encoding: "utf8",
    shell: process.platform === "win32",
    stdio: capture ? ["inherit", "pipe", "pipe"] : "inherit",
  });
  return { ok: res.status === 0, out: `${res.stdout ?? ""}`.trim(), err: `${res.stderr ?? ""}`.trim() };
}

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = async q => (await rl.question(`[release] ${q} `)).trim();

// 1. Pre-flight
log("pré-vol…");
const branch = run("git", ["rev-parse", "--abbrev-ref", "HEAD"]).out;
if (branch !== "main") die(`branche courante "${branch}" — il faut être sur main`);
guard(!run("git", ["status", "--porcelain"]).out, "arbre de travail sale — commit ou stash d'abord");
if (!run("git", ["fetch", "origin"]).ok) die("git fetch origin a échoué");
const [behind, ahead] = run("git", ["rev-list", "--left-right", "--count", "origin/main...HEAD"]).out.split(/\s+/);
guard(behind === "0" && ahead === "0", `main diverge de origin/main (derrière ${behind}, devant ${ahead})`);
const pending = readdirSync(join(root, ".changeset")).filter(f => f.endsWith(".md") && f !== "README.md");
if (pending.length) die(`changesets non consommés (${pending.join(", ")}) — merge d'abord la PR "version packages"`);

// 2. Target version
const libDir = join(root, "projects", "ngx-call");
const version = JSON.parse(readFileSync(join(libDir, "package.json"), "utf8")).version;
const tag = `v${version}`;
log(`version cible : ${version} (tag ${tag})`);
guard(!run("git", ["tag", "-l", tag]).out, `le tag ${tag} existe déjà en local`);
guard(!run("git", ["ls-remote", "--tags", "origin", tag]).out, `le tag ${tag} existe déjà sur origin`);
guard(!run("npm", ["view", `${PKG}@${version}`, "version", ...npmAuth]).out, `${PKG}@${version} est déjà publié sur npm`);

// 3. npm identity
const who = run("npm", ["whoami", ...npmAuth]);
if (!who.ok) die(`npm whoami a échoué — authentifie-toi d'abord (npm login${opts.userconfig ? ` --userconfig ${opts.userconfig}` : ""})`);
log(`compte npm : ${who.out}`);
if (!opts.yes && !dryRun) {
  const answer = await ask(`Publier ${PKG}@${version} avec le compte "${who.out}" ? (oui/non)`);
  if (!/^(o|oui|y|yes)$/i.test(answer)) die("annulé");
}

// 4. Build
log("build…");
if (!run("npx", ["ng", "build", "ngx-call"], { capture: false }).ok) die("ng build a échoué");
const built = JSON.parse(readFileSync(join(root, "dist", "ngx-call", "package.json"), "utf8")).version;
if (built !== version) die(`dist/ngx-call est en ${built}, attendu ${version}`);

// 5. Publish (point of no return)
const publishArgs = ["publish", "./dist/ngx-call", "--access", "public", ...npmAuth];
if (dryRun) {
  log("--dry-run : npm publish --dry-run");
  // Fails with "cannot publish over the previously published version" when rehearsing on a released version.
  guard(run("npm", [...publishArgs, "--dry-run"], { capture: false }).ok, "npm publish --dry-run a échoué");
} else {
  let otp = opts.otp;
  for (;;) {
    otp ||= await ask("code OTP (6 chiffres) :");
    const res = run("npm", [...publishArgs, `--otp=${otp}`]);
    if (res.out) console.log(res.out);
    if (res.ok) break;
    console.error(res.err);
    if (!/EOTP/.test(res.err)) die("npm publish a échoué — rien n'a été tagué");
    log("OTP invalide ou expiré");
    otp = undefined;
  }
}

// 6. Wait for the registry (can lag about a minute)
if (!dryRun) {
  log("attente de la propagation sur le registre…");
  const deadline = Date.now() + 3 * 60_000;
  for (;;) {
    const seen = run("npm", ["view", `${PKG}@${version}`, "version", "--prefer-online", ...npmAuth]).out;
    const latest = run("npm", ["view", PKG, "dist-tags.latest", "--prefer-online", ...npmAuth]).out;
    if (seen === version && latest === version) break;
    if (Date.now() > deadline) die(`${PKG}@${version} pas visible après 3 min — vérifie puis tague à la main (${tag})`);
    await new Promise(r => setTimeout(r, 5000));
  }
  log(`${PKG}@${version} visible, dist-tag latest = ${version}`);
}

// 7. Tag + push (only after a successful publish)
if (dryRun) {
  log(`--dry-run : git tag -a ${tag} && git push origin ${tag}`);
} else {
  if (!run("git", ["tag", "-a", tag, "-m", `${PKG} ${tag}`]).ok) die(`git tag ${tag} a échoué`);
  if (!run("git", ["push", "origin", tag]).ok) die(`git push origin ${tag} a échoué`);
}

// 8. GitHub Release — notes extracted from the CHANGELOG section of this version
const changelog = readFileSync(join(libDir, "CHANGELOG.md"), "utf8").split(/\r?\n/);
const start = changelog.findIndex(l => l.trim() === `## ${version}`);
const notes = [];
if (start !== -1) {
  for (const line of changelog.slice(start + 1)) {
    if (line.startsWith("## ")) break;
    notes.push(line);
  }
}
const notesFile = join(tmpdir(), `ngx-call-notes-${version}.md`);
writeFileSync(notesFile, notes.join("\n").trim() + "\n", "utf8");
if (start === -1) log(`⚠ section ## ${version} introuvable dans CHANGELOG.md — notes vides`);
if (dryRun) {
  log(`--dry-run : gh release create ${tag} --repo ${REPO} --notes-file ${notesFile}`);
  console.log(notes.join("\n").trim());
} else {
  const rel = run("gh", ["release", "create", tag, "--repo", REPO, "--title", tag, "--notes-file", notesFile]);
  if (!rel.ok) die(`gh release create a échoué (le tag ${tag} est déjà poussé) : ${rel.err}`);
}

rl.close();

// 9. Report
log(dryRun ? "dry-run terminé — rien n'a été publié" : `✔ ${PKG}@${version} publié`);
log(`npm     : https://www.npmjs.com/package/${PKG}`);
log(`release : https://github.com/${REPO}/releases/tag/${tag}`);
log("démo    : https://hebus.github.io/ngx-call/");
