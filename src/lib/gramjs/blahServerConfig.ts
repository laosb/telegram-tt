// BLAH: build-time local-server override. vite.config.ts injects the parsed
// blah-server.config.json as the `BLAH_SERVER_CONFIG` global (or `undefined`).
// This module normalizes it into a per-DC topology — multiple DCs, each with
// its own RSA key and one or more IP/port endpoints — and exposes the small
// lookups the gramjs layer needs.

type BlahEndpoint = { ip: string; port: number };
type BlahRsaKey = { fingerprint: string; nHex: string; e: number };
type BlahDc = { id: number; endpoints: BlahEndpoint[]; rsaKey?: BlahRsaKey };
type NormalizedConfig = { dcs: BlahDc[]; defaultDcId: number };

const CONFIG = normalize();

function normalize(): NormalizedConfig | undefined {
  if (typeof BLAH_SERVER_CONFIG === 'undefined' || !BLAH_SERVER_CONFIG) return undefined;
  const raw = BLAH_SERVER_CONFIG;
  if (!raw.dcs?.length) return undefined;

  const dcs = raw.dcs
    .map((dc) => ({ id: dc.id, endpoints: dc.endpoints ?? [], rsaKey: dc.rsaKey }))
    .filter((dc) => dc.endpoints.length > 0);
  if (!dcs.length) return undefined;

  return { dcs, defaultDcId: raw.defaultDcId ?? dcs[0].id };
}

export function isBlahServerActive(): boolean {
  return CONFIG !== undefined;
}

export function getBlahDefaultDcId(): number | undefined {
  return CONFIG?.defaultDcId;
}

// The DC entry for `dcId`, falling back to the default DC so a request for a DC
// the override doesn't describe still reaches the local deployment (mirrors the
// previous "route every DC to the local server" behavior).
function resolveDc(dcId: number): BlahDc | undefined {
  if (!CONFIG) return undefined;
  return CONFIG.dcs.find((dc) => dc.id === dcId)
    ?? CONFIG.dcs.find((dc) => dc.id === CONFIG.defaultDcId)
    ?? CONFIG.dcs[0];
}

// One endpoint for `dcId`, in gramjs's getDC shape. Several endpoints may be
// configured per DC; the first is used (the rest are alternates).
export function getBlahDcOption(
  dcId: number,
): { id: number; ipAddress: string; port: number } | undefined {
  const dc = resolveDc(dcId);
  if (!dc) return undefined;
  const { ip, port } = dc.endpoints[0];
  return { id: dcId, ipAddress: ip, port };
}

// Every configured DC's RSA key, ready for SERVER_KEYS registration.
export function getBlahRsaKeys(): Array<{ fingerprint: bigint; n: bigint; e: number }> {
  if (!CONFIG) return [];
  return CONFIG.dcs
    .filter((dc): dc is BlahDc & { rsaKey: BlahRsaKey } => Boolean(dc.rsaKey))
    .map((dc) => ({
      fingerprint: BigInt(dc.rsaKey.fingerprint),
      n: BigInt(`0x${dc.rsaKey.nHex}`),
      e: dc.rsaKey.e,
    }));
}
