import i18next from 'i18next';
import i18nextMiddleware from 'i18next-http-middleware';
import Backend from 'i18next-fs-backend';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM-compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

i18next
  .use(Backend)
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    fallbackLng: 'en', // Default language
    backend: {
      loadPath: path.join(__dirname, '../locales/{{lng}}/{{ns}}.json'), // Path to translation files
    },
    detection: {
      order: ['header'], // Detect language from the `Accept-Language` header
      caches: ['cookie'], // Cache the detected language in a cookie
    },
  });

export const localizationMiddleware = i18nextMiddleware.handle(i18next);
