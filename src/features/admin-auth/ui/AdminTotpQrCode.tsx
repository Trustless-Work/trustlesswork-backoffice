"use client";

import { QRCodeSVG } from "qrcode.react";
import { ADMIN_TOTP_ISSUER } from "@/features/admin-auth/constants/admin-auth.constants";
import { resolveTotpQrValue } from "@/features/admin-auth/utils/totp-qr";

type AdminTotpQrCodeProps = {
  uri: string;
  secret: string;
};

/**
 * Draws the enrollment QR from the TOTP `otpauth://` URI (falling back to
 * rebuilding that URI from the secret). Generating the matrix here avoids
 * GoTrue's raw SVG payload, which is not a valid `img` src and often starts
 * with an XML prolog/comment that we cannot inline safely.
 *
 * The pad is forced white so authenticator apps can scan it in dark mode.
 */
export const AdminTotpQrCode = ({ uri, secret }: AdminTotpQrCodeProps) => {
  const value = resolveTotpQrValue({
    uri,
    secret,
    issuer: ADMIN_TOTP_ISSUER,
  });

  if (value === null) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        The QR code could not be displayed. Open &ldquo;Can&apos;t scan&rdquo;
        for the setup key.
      </p>
    );
  }

  return (
    <div
      className="mx-auto w-fit rounded-xl bg-white p-3"
      aria-label="Two-factor enrollment QR code"
    >
      <QRCodeSVG
        value={value}
        size={144}
        bgColor="#ffffff"
        fgColor="#000000"
        level="M"
      />
    </div>
  );
};
