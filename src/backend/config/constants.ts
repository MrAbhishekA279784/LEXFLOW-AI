export const CONSTANTS = {
  APP_NAME: 'LEXFLOW',
  APP_VERSION: '1.0.0',
  API_V1_PREFIX: '/api/v1',
  DEFAULT_PORT: 3000,
  
  // Security & Limits
  MAX_FILE_SIZE_BYTES: 15 * 1024 * 1024, // 15MB
  MAX_PDF_PAGES: 100,
  MAX_TEXT_LENGTH_CHARS: 250_000,
  ALLOWED_MIME_TYPES: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
  ],
  ALLOWED_EXTENSIONS: ['.pdf', '.docx', '.doc', '.txt'],
  
  // Rate Limiting
  RATE_LIMIT_STANDARD_MAX: 120, // 120 reqs / 15 mins for cheap
  RATE_LIMIT_EXPENSIVE_MAX: 30,  // 30 reqs / 15 mins for AI / scenario / analysis
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000,

  // Disclaimers
  LEGAL_DISCLAIMER: 'LEXFLOW provides informational analysis based on the provided document and retrieved legal sources. It does not provide legal advice or replace a qualified legal professional.',
  INSUFFICIENT_EVIDENCE_MESSAGE: 'Insufficient evidence found in the provided document or retrieved legal sources.',
  
  // AI Timeouts
  AI_REQUEST_TIMEOUT_MS: 30_000,
  AI_MAX_RETRIES: 2,
};
