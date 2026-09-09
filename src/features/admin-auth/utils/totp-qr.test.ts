import { describe, expect, it } from "vitest";
import {
  buildTotpOtpauthUri,
  resolveTotpQrValue,
} from "@/features/admin-auth/utils/totp-qr";

const SECRET = "XS542KX72M4NGAJCNCZMMHHETN3SAVPA";
const URI =
  "otpauth://totp/Trustless%20Work%20Backoffice:ada@trustlesswork.com?secret=XS542KX72M4NGAJCNCZMMHHETN3SAVPA&issuer=Trustless%20Work%20Backoffice";

describe("resolveTotpQrValue", () => {
  it("prefers the otpauth uri from enroll", () => {
    expect(resolveTotpQrValue({ uri: URI, secret: SECRET })).toBe(URI);
  });

  it("rebuilds an otpauth uri from the secret when enroll did not send one", () => {
    expect(
      resolveTotpQrValue({
        uri: "",
        secret: SECRET,
        issuer: "Trustless Work Backoffice",
      }),
    ).toBe(
      "otpauth://totp/Trustless%20Work%20Backoffice?secret=XS542KX72M4NGAJCNCZMMHHETN3SAVPA&issuer=Trustless%20Work%20Backoffice&algorithm=SHA1&digits=6&period=30",
    );
  });

  it("strips spaces from a manually copied secret", () => {
    const value = resolveTotpQrValue({
      uri: null,
      secret: "XS54 2KX7 2M4N GAJC",
      issuer: "TW",
    });

    expect(value).toContain("secret=XS542KX72M4NGAJC");
  });

  it("returns null when neither uri nor secret is usable", () => {
    expect(resolveTotpQrValue({ uri: "not-otpauth", secret: "  " })).toBeNull();
  });
});

describe("buildTotpOtpauthUri", () => {
  it("encodes spaces in the issuer and optional account", () => {
    expect(
      buildTotpOtpauthUri({
        secret: SECRET,
        issuer: "Trustless Work Backoffice",
        account: "ada@trustlesswork.com",
      }),
    ).toBe(
      "otpauth://totp/Trustless%20Work%20Backoffice:ada%40trustlesswork.com?secret=XS542KX72M4NGAJCNCZMMHHETN3SAVPA&issuer=Trustless%20Work%20Backoffice&algorithm=SHA1&digits=6&period=30",
    );
  });
});
