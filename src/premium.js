export const FREE_MONTHLY_NOTE_LIMIT = 10;
const PREMIUM_DAYS_MS = 28 * 24 * 60 * 60 * 1000;

const DEVICE_KEY = 'learnito_device_id';
const USAGE_KEY = 'learnito_usage';
const PREMIUM_KEY = 'learnito_premium';
const ADMIN_CODES_KEY = 'learnito_admin_codes';
const PREMIUM_DEVICES_KEY = 'learnito_premium_devices';
const VALID_DEMO_CODES = new Set(['LEARNITO-PRO', 'LEARNITO-2026', 'STUDY-PRO', 'TR-LEARNITO']);
const DEVICE_CODE_PREFIX = 'LA';
const DEVICE_CODE_SECRET = 'LEARNITO-DEVICE-PREMIUM-2026';

export function getOrCreateDeviceId() {
  let saved = localStorage.getItem(DEVICE_KEY);

  if (!saved) {
    saved = createDeviceId();
    localStorage.setItem(DEVICE_KEY, saved);
  }

  return saved;
}

export function getUsageStatus() {
  deactivateExpiredPremium();
  const usage = resetMonthlyUsageIfNeeded();
  const premium = readPremium();
  const devicePremium = getPremiumDevice(getOrCreateDeviceId());
  const month = currentMonthKey();
  const count = usage.count;
  const premiumActive = isPremiumActive(premium) || isPremiumActive(devicePremium);

  return {
    count,
    limit: FREE_MONTHLY_NOTE_LIMIT,
    month,
    premiumActive,
    remaining: premiumActive ? null : Math.max(0, FREE_MONTHLY_NOTE_LIMIT - count)
  };
}

export function incrementUsage() {
  const status = getUsageStatus();
  localStorage.setItem(USAGE_KEY, JSON.stringify({ month: status.month, count: status.count + 1 }));
  return getUsageStatus();
}

export function activatePremiumCode(code) {
  const normalized = code.trim().toUpperCase();
  const deviceId = getOrCreateDeviceId();
  const deviceCode = createDevicePremiumCode(deviceId);
  const storedCodes = getPremiumCodes();
  const storedCode = storedCodes.find((item) => item.code === normalized);

  if (!VALID_DEMO_CODES.has(normalized) && normalized !== deviceCode && !storedCode) {
    return { ok: false, error: 'Premium code is invalid for this device.' };
  }

  if (storedCode && (!storedCode.active || storedCode.usedByDeviceId)) {
    return { ok: false, error: 'Premium code is invalid or already used.' };
  }

  const expiresAt = Date.now() + PREMIUM_DAYS_MS;
  localStorage.setItem(PREMIUM_KEY, JSON.stringify({ active: true, expiresAt }));
  upsertPremiumDevice(deviceId, true, expiresAt);

  if (storedCode) {
    savePremiumCodes(
      storedCodes.map((item) =>
        item.code === normalized
          ? { ...item, active: false, usedByDeviceId: deviceId, usedAt: new Date().toISOString() }
          : item
      )
    );
  }

  return { ok: true };
}

export function getAdminSnapshot() {
  deactivateExpiredPremium();
  const usage = resetMonthlyUsageIfNeeded();
  const usageRows = usage.month
    ? [{ id: `${getOrCreateDeviceId()}-${usage.month}`, deviceId: getOrCreateDeviceId(), month: usage.month, count: usage.count }]
    : [];
  const premiumRows = getPremiumDevices();
  const devices = new Map();

  for (const row of usageRows) {
    devices.set(row.deviceId, {
      deviceId: row.deviceId,
      expiresAt: null,
      premiumActive: false,
      usageCount: row.count
    });
  }

  for (const premium of premiumRows) {
    const existing = devices.get(premium.deviceId);
    devices.set(premium.deviceId, {
      deviceId: premium.deviceId,
      expiresAt: premium.expiresAt ? new Date(premium.expiresAt).toISOString() : null,
      premiumActive: isPremiumActive(premium),
      usageCount: existing?.usageCount ?? 0
    });
  }

  return {
    codes: getPremiumCodes(),
    devices: [...devices.values()],
    usage: usageRows
  };
}

export function createPremiumCode() {
  const code = {
    active: true,
    code: createCode(),
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + PREMIUM_DAYS_MS).toISOString(),
    id: crypto.randomUUID ? crypto.randomUUID() : `code-${Date.now()}`,
    usedByDeviceId: null
  };

  savePremiumCodes([code, ...getPremiumCodes()]);
  return code;
}

export function createDevicePremiumCode(deviceId) {
  const normalized = deviceId.trim();

  if (!normalized) {
    return '';
  }

  return `${DEVICE_CODE_PREFIX}-${hashCode(`${DEVICE_CODE_SECRET}:${normalized}`).slice(0, 12)}`;
}
export function setPremiumDevice(deviceId, active) {
  const normalized = deviceId.trim();

  if (!normalized) {
    return { ok: false, error: 'Device ID is required.' };
  }

  const expiresAt = active ? Date.now() + PREMIUM_DAYS_MS : Date.now();
  upsertPremiumDevice(normalized, active, expiresAt);

  if (normalized === getOrCreateDeviceId()) {
    if (active) {
      localStorage.setItem(PREMIUM_KEY, JSON.stringify({ active, expiresAt }));
    } else {
      localStorage.removeItem(PREMIUM_KEY);
    }
  }

  return { ok: true };
}

function createDeviceId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `device-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function currentMonthKey(date = new Date()) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

function readUsage() {
  try {
    return JSON.parse(localStorage.getItem(USAGE_KEY)) || { month: currentMonthKey(), count: 0 };
  } catch {
    return { month: currentMonthKey(), count: 0 };
  }
}

function resetMonthlyUsageIfNeeded() {
  const month = currentMonthKey();
  const usage = readUsage();

  if (usage.month !== month) {
    const resetUsage = { month, count: 0 };
    localStorage.setItem(USAGE_KEY, JSON.stringify(resetUsage));
    return resetUsage;
  }

  return usage;
}

function readPremium() {
  try {
    return JSON.parse(localStorage.getItem(PREMIUM_KEY)) || { active: false };
  } catch {
    return { active: false };
  }
}

function getPremiumCodes() {
  try {
    return JSON.parse(localStorage.getItem(ADMIN_CODES_KEY)) || [];
  } catch {
    return [];
  }
}

function savePremiumCodes(codes) {
  localStorage.setItem(ADMIN_CODES_KEY, JSON.stringify(codes));
}

function getPremiumDevices() {
  try {
    return JSON.parse(localStorage.getItem(PREMIUM_DEVICES_KEY)) || [];
  } catch {
    return [];
  }
}

function getPremiumDevice(deviceId) {
  return getPremiumDevices().find((device) => device.deviceId === deviceId) || { active: false };
}

function upsertPremiumDevice(deviceId, active, expiresAt) {
  const devices = getPremiumDevices();
  const nextDevice = {
    active,
    deviceId,
    expiresAt,
    updatedAt: new Date().toISOString()
  };

  localStorage.setItem(
    PREMIUM_DEVICES_KEY,
    JSON.stringify([nextDevice, ...devices.filter((device) => device.deviceId !== deviceId)])
  );
}

function deactivateExpiredPremium() {
  const now = Date.now();
  const localPremium = readPremium();

  if (localPremium.active && localPremium.expiresAt && Number(localPremium.expiresAt) <= now) {
    localStorage.removeItem(PREMIUM_KEY);
  }

  const devices = getPremiumDevices();
  const nextDevices = devices.map((device) => {
    if (device.active && device.expiresAt && Number(device.expiresAt) <= now) {
      return {
        ...device,
        active: false,
        deactivatedAt: new Date(now).toISOString(),
        updatedAt: new Date(now).toISOString()
      };
    }

    return device;
  });

  localStorage.setItem(PREMIUM_DEVICES_KEY, JSON.stringify(nextDevices));
}

function isPremiumActive(premium) {
  return Boolean(premium?.active && (!premium.expiresAt || Number(premium.expiresAt) > Date.now()));
}

function hashCode(value) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  const first = (hash >>> 0).toString(16).toUpperCase().padStart(8, '0');
  let secondHash = 2166136261;

  for (let index = value.length - 1; index >= 0; index -= 1) {
    secondHash ^= value.charCodeAt(index);
    secondHash = Math.imul(secondHash, 16777619);
  }

  return `${first}${(secondHash >>> 0).toString(16).toUpperCase().padStart(8, '0')}`;
}
function createCode() {
  const random = Math.random().toString(16).slice(2, 14).toUpperCase().padEnd(12, '0');
  return `TR-${random}`;
}
