# Altair AI LLC Homepage

Elegant, single-page marketing site for Altair's local services platform.

## Getting started

1. Install Node.js 20+.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```

## Tests

- Unit tests:
  ```bash
  npm run test:unit
  ```
- End-to-end tests:
  ```bash
  npx playwright install
  npm run test:e2e
  ```

## Notes

- The hero section includes a "Generate new image & elements" button that regenerates the background and decorative elements.
- Replace the hero background with a real photo by swapping the styling in `src/components/Hero.tsx`.
