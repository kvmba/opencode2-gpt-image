export const DEFAULT_IMAGE_MODEL = "gpt-image-2"
export const CODEX_IMAGE_MODEL = "gpt-image-2"
export const MODEL_ID_PATTERN = /^\S+$/

export function modelName(value: unknown): string {
  if (typeof value !== "string" || !MODEL_ID_PATTERN.test(value)) {
    throw new Error("Image model ID must be a non-empty string without whitespace")
  }
  return value
}
