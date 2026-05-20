const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const appsDir = path.join(root, "apps");
const publicDir = path.join(root, "public");
const templatePath = path.join(root, "templates", "privacy.html");
const supportTemplatePath = path.join(root, "templates", "support.html");

const template = fs.readFileSync(templatePath, "utf8");
const supportTemplate = fs.readFileSync(supportTemplatePath, "utf8");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderList(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return "";
  }

  return [
    "<ul>",
    ...items.map((item) => `      <li>${escapeHtml(item)}</li>`),
    "    </ul>"
  ].join("\n");
}

function renderThirdPartyServices(services) {
  if (!Array.isArray(services) || services.length === 0) {
    return "<p>No third-party services are currently used to collect, process, or store user data.</p>";
  }

  return services.map((service) => {
    const name = escapeHtml(service.name);
    const description = escapeHtml(service.description);
    const privacyUrl = escapeHtml(service.privacyUrl);
    const privacyLabel = escapeHtml(service.privacyLabel || `${service.name} privacy policy`);

    return `<p><strong>${name}</strong>: ${description} <a href="${privacyUrl}" target="_blank" rel="noopener">${privacyLabel}</a>.</p>`;
  }).join("\n    ");
}

function renderTemplate(app, sourceTemplate) {
  const githubOrgLabel = app.githubOrgUrl.replace(/^https?:\/\//, "");
  const values = {
    ...app,
    year: new Date().getFullYear(),
    githubOrgLabel,
    localDataList: renderList(app.localDataItems),
    supportList: renderList(app.supportItems),
    useList: renderList(app.useItems),
    thirdPartyServices: renderThirdPartyServices(app.thirdPartyServices)
  };

  return sourceTemplate.replace(/\{\{([a-zA-Z0-9]+)\}\}/g, (_, key) => {
    if (!(key in values)) {
      throw new Error(`Missing template value: ${key}`);
    }

    const rawHtmlKeys = new Set(["localDataList", "supportList", "useList", "thirdPartyServices"]);
    return rawHtmlKeys.has(key) ? values[key] : escapeHtml(values[key]);
  });
}

function validateApp(app, fileName) {
  const required = [
    "slug",
    "appName",
    "lastUpdated",
    "tagline",
    "contactEmail",
    "publicUrl",
    "supportUrl",
    "commitHistoryUrl",
    "supportCommitHistoryUrl",
    "personalDataSummary",
    "localDataIntro",
    "supportIntro",
    "supportResponseTime",
    "trackingStatement",
    "disabledServicesStatement",
    "retentionStatement",
    "childrenStatement"
  ];

  for (const key of required) {
    if (!app[key]) {
      throw new Error(`${fileName} is missing required field: ${key}`);
    }
  }

  if (!/^[a-z0-9-]+$/.test(app.slug)) {
    throw new Error(`${fileName} has invalid slug: ${app.slug}`);
  }
}

const appFiles = fs.readdirSync(appsDir)
  .filter((fileName) => fileName.endsWith(".json") && !fileName.endsWith(".example.json"))
  .sort();

if (appFiles.length === 0) {
  throw new Error("No app metadata files found in apps/.");
}

for (const fileName of appFiles) {
  const filePath = path.join(appsDir, fileName);
  const app = JSON.parse(fs.readFileSync(filePath, "utf8"));
  validateApp(app, fileName);

  const privacyHtml = renderTemplate(app, template);
  const privacyOutputDir = path.join(publicDir, app.slug, "privacy");
  fs.mkdirSync(privacyOutputDir, { recursive: true });
  fs.writeFileSync(path.join(privacyOutputDir, "index.html"), privacyHtml);

  const supportHtml = renderTemplate(app, supportTemplate);
  const supportOutputDir = path.join(publicDir, app.slug, "support");
  fs.mkdirSync(supportOutputDir, { recursive: true });
  fs.writeFileSync(path.join(supportOutputDir, "index.html"), supportHtml);

  console.log(`Generated public/${app.slug}/privacy/index.html`);
  console.log(`Generated public/${app.slug}/support/index.html`);
}
