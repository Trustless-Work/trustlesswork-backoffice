import { ADMIN_TOTP_ISSUER } from "@/features/admin-auth/constants/admin-auth.constants";

type TotpQrValueInput = {
  readonly uri: string | null | undefined;
  readonly secret: string | null | undefined;
  readonly issuer?: string;
};

/**
 * Value encoded into the enrollment QR.
 *
 * Prefer the `otpauth://` URI from `mfa.enroll` — that is the exact payload
 * GoTrue generated the factor with. If it is missing, rebuild it from the
 * TOTP secret so the authenticator still enrolls the same factor.
 *
 * Never log the input or the output — both encode the TOTP secret.
 */
export function resolveTotpQrValue(input: TotpQrValueInput): string | null {
  const uri = input.uri?.trim() ?? "";
  if (uri.startsWith("otpauth://")) {
    return uri;
  }

  const secret = (input.secret ?? "").replace(/\s+/g, "");
  if (secret.length === 0) {
    return null;
  }

  return buildTotpOtpauthUri({
    secret,
    issuer: input.issuer?.trim() || ADMIN_TOTP_ISSUER,
  });
}

export function buildTotpOtpauthUri(options: {
  secret: string;
  issuer: string;
  account?: string;
}): string {
  const issuer = encodeURIComponent(options.issuer);
  const label = options.account
    ? `${issuer}:${encodeURIComponent(options.account)}`
    : issuer;

  const query = [
    `secret=${options.secret}`,
    `issuer=${issuer}`,
    "algorithm=SHA1",
    "digits=6",
    "period=30",
  ].join("&");

  return `otpauth://totp/${label}?${query}`;
}
