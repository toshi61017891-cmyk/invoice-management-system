/**
 * 安全なログ出力ヘルパー
 *
 * APIキーやトークンなどの秘密情報を自動的に [REDACTED] に置換します。
 * ログやエラーメッセージに使用してください。
 */

const SENSITIVE_PATTERNS = [
  /sk-[\w-]{16,}/gi, // Resend API Key等
  /Bearer\s+[A-Za-z0-9._-]+/gi, // Bearer token
  /api[_-]?key[=:]\s*['"]?[\w-]+/gi, // api_key=xxx
  /password[=:]\s*['"]?[^\s'"]+/gi, // password=xxx
  /secret[=:]\s*['"]?[\w-]+/gi, // secret=xxx
];

/**
 * 文字列内の秘密情報を [REDACTED] に置換
 */
export function redact(text: string): string {
  return SENSITIVE_PATTERNS.reduce(
    (result, pattern) => result.replace(pattern, "[REDACTED]"),
    text,
  );
}

/**
 * オブジェクトを安全に文字列化（秘密情報をマスク）
 */
export function safeStringify(obj: unknown): string {
  return redact(JSON.stringify(obj, null, 2));
}
