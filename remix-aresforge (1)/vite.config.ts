import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'icon.svg',
          'apple-touch-icon.png',
          'pwa-192x192.png',
          'pwa-512x512.png',
          'pwa-maskable-512x512.png',
          'privacy.html',
          'terms.html',
          'support.html',
          'screenshots/mobile-preview.jpg',
          'screenshots/desktop-preview.jpg',
        ],
        manifest: {
          id: '/',
          name: 'ARESFORGE — Workout & Nutrition',
          short_name: 'ARESFORGE',
          description:
            'Tactical and athletic workout programs (AFT, Hybrid, Law Enforcement), custom routine builder, barcode nutrition and liter hydration tracker, wearable sync, and progress analytics.',
          lang: 'en',
          dir: 'ltr',
          theme_color: '#2563EB',
          background_color: '#020617',
          display: 'standalone',
          display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],
          orientation: 'any',
          start_url: '/?source=pwa',
          scope: '/',
          categories: ['health', 'fitness', 'sports', 'lifestyle'],
          prefer_related_applications: false,
          launch_handler: {
            client_mode: 'focus-existing',
          },
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
          screenshots: [
            {
              src: '/screenshots/mobile-preview.jpg',
              sizes: '768x1376',
              type: 'image/jpeg',
              form_factor: 'narrow',
              platform: 'android',
              label: 'ARESFORGE mobile dashboard with calorie budget, liter hydration, and workout launcher',
            },
            {
              src: '/screenshots/desktop-preview.jpg',
              sizes: '1376x768',
              type: 'image/jpeg',
              form_factor: 'wide',
              label: 'ARESFORGE desktop overview with AFT, Hybrid, and Law Enforcement training programs',
            },
          ],
          shortcuts: [
            {
              name: 'Start Workout',
              short_name: 'Workouts',
              description: 'Open AFT, Hybrid, Law Enforcement, and custom workout programs',
              url: '/?tab=workouts',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' }],
            },
            {
              name: 'Scan Food Barcode',
              short_name: 'Scan Food',
              description: 'Scan a food barcode to log calories and macros',
              url: '/?tab=nutrition&scan=1',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' }],
            },
            {
              name: 'Nutrition & Hydration',
              short_name: 'Nutrition',
              description: 'Log meals and daily hydration in liters',
              url: '/?tab=nutrition',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' }],
            },
          ],
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,jpg}'],
          navigateFallbackDenylist: [/^\/privacy\.html$/, /^\/terms\.html$/, /^\/support\.html$/],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/world\.openfoodfacts\.org\/api\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'openfoodfacts-cache',
                expiration: {
                  maxEntries: 80,
                  maxAgeSeconds: 60 * 60 * 24 * 7,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
      {
        name: 'disable-hmr-client-socket',
        apply: 'serve',
        transform(code, id) {
          if (!id.replace(/\\/g, '/').endsWith('vite/dist/client/client.mjs')) {
            return;
          }
          const transportPattern =
            /const transport = normalizeModuleRunnerTransport\(\(\(\) => \{[\s\S]*?\n\}\)\(\)\);/;
          if (transportPattern.test(code)) {
            return {
              code: code.replace(
                transportPattern,
                `const transport = normalizeModuleRunnerTransport({\n\tconnect() {},\n\tdisconnect() {},\n\tsend() {},\n});`
              ),
              map: null,
            };
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      hmr: false,
      ws: false,
      watch: null,
    },
  };
});
