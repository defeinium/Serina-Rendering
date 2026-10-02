# Publish the Serina viewer on GitHub Pages

The viewer is a static HTML/CSS/JavaScript site, so it can run on GitHub Pages without a server. The repository workflow at `.github/workflows/deploy-serina-pages.yml` publishes `site-serina-electrical-viewer/dist` whenever `main` is updated.

## One-time setup

1. Put this project in a GitHub repository and push the `main` branch.
2. The simplest deployment is **Settings → Pages → Deploy from a branch**.
3. Select branch `main` and folder `/docs`, then click **Save**.
4. GitHub will show the live address under **Settings → Pages**.

The repository also contains a GitHub Actions workflow for accounts where Actions are available. If Actions is blocked by a billing lock, use the branch deployment above; it does not require a workflow job.

For the repository you supplied, the address will normally be:

`https://defeinium.github.io/Serina-Rendering/`

GitHub Free supports Pages for public repositories. A private repository requires a plan that includes private-repository Pages. The repository will be public if you use a public repo, so remove any private quotations, defect reports, floor plans, or personal documents before pushing; this viewer folder contains the web app only.

The viewer loads Three.js from jsDelivr, so the other computer needs an internet connection. The published page is read-only; changes still happen in the local source and are republished after pushing.
