export function normalizeText(value: string) {
  return value.trim();
}

export function normalizeOptionalText(value: string | null | undefined) {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  const normalizedValue = value.trim();

  return normalizedValue.length > 0 ? normalizedValue : null;
}

export function normalizeSlug(value: string) {
  return value.trim().toLowerCase();
}

export function normalizeCode(value: string) {
  return value.trim().toUpperCase();
}
