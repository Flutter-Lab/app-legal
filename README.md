# App Legal Pages

Shared GitHub Pages site for app privacy policies published by Flutter Lab.

Live URL pattern after GitHub Pages is enabled:

- `https://flutter-lab.github.io/app-legal/certflow/privacy/`
- `https://flutter-lab.github.io/app-legal/certflow/support/`
- `https://flutter-lab.github.io/app-legal/vocapal/privacy/`
- `https://flutter-lab.github.io/app-legal/vocapal/support/`

## Update a Policy

1. Edit the app metadata file in `apps/`.
2. If shared wording or layout needs to change, edit `templates/privacy.html`.
3. Run:

   ```sh
   node scripts/build.js
   ```

4. Review the generated page in `public/<app-slug>/privacy/index.html`.
5. Commit and push to `main`.

GitHub Pages should be configured to publish with GitHub Actions. The workflow in `.github/workflows/pages.yml` builds the generated files and deploys the `public/` folder.

## Add a New App

1. Copy `apps/vocapal.example.json` to `apps/<app-slug>.json`.
2. Replace every app-specific field.
3. Run `node scripts/build.js`.
4. Add the generated privacy URL to App Store Connect or Google Play Console.

## First-Time GitHub Setup

Create a public repository named `app-legal` under `Flutter-Lab`, then push this folder:

```sh
git init
git add .
git commit -m "Create shared legal pages"
git branch -M main
git remote add origin https://github.com/Flutter-Lab/app-legal.git
git push -u origin main
```

Then open GitHub repo settings:

- Settings -> Pages
- Source: `GitHub Actions`

The included workflow deploys `public/` automatically on every push to `main`.

## Notes

This repository helps publish consistent policy pages, but it is not a substitute for legal review. Update each app metadata file before enabling analytics, crash reporting, ads, user accounts, purchases, cloud sync, or any third-party service that handles user data.
