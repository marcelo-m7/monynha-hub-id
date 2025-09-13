// Use CommonJS export so Next.js can load this file without a default wrapper
// Tailwind CSS v4 relies on the `@tailwindcss/postcss` plugin instead of the
// older `tailwindcss` plugin. This configuration aligns with the new plugin
// while avoiding the `__esModule` warning that appeared during build.
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
