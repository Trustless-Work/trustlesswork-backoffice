import { beforeEach, describe, expect, it, vi } from "vitest";
import http from "@/lib/http";
import { organizationService } from "@/features/organizations/services/organization.service";

vi.mock("@/lib/http", () => ({
  default: {
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

const VALID_WALLET = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";

const subject = {
  id: "subject-1",
  platformId: "platform-1",
  externalId: "user-1",
  walletAddress: VALID_WALLET,
};

describe("OrganizationService subject writes", () => {
  beforeEach(() => {
    vi.mocked(http.post).mockReset();
    vi.mocked(http.patch).mockReset();
    vi.mocked(http.post).mockResolvedValue({ data: subject });
    vi.mocked(http.patch).mockResolvedValue({ data: subject });
  });

  it("sends a trimmed walletAddress on create", async () => {
    await organizationService.upsertMember("platform-1", {
      externalId: "user-1",
      label: "Ada",
      walletAddress: `  ${VALID_WALLET}  `,
    });

    expect(http.post).toHaveBeenCalledWith(
      "/core/platforms/platform-1/subjects",
      {
        externalId: "user-1",
        label: "Ada",
        walletAddress: VALID_WALLET,
      },
    );
  });

  it("omits walletAddress on create when it is empty or invalid", async () => {
    await organizationService.upsertMember("platform-1", {
      externalId: "user-1",
      label: "Ada",
      walletAddress: "",
    });

    expect(http.post).toHaveBeenCalledWith(
      "/core/platforms/platform-1/subjects",
      {
        externalId: "user-1",
        label: "Ada",
      },
    );
  });

  it("sends walletAddress on update and leaves other fields untouched", async () => {
    await organizationService.updateMember("platform 1", "subject/1", {
      walletAddress: VALID_WALLET,
    });

    expect(http.patch).toHaveBeenCalledWith(
      "/core/platforms/platform%201/subjects/subject%2F1",
      { walletAddress: VALID_WALLET },
    );
  });

  it("drops an invalid walletAddress from an update payload", async () => {
    await organizationService.updateMember("platform-1", "subject-1", {
      label: "Ada",
      walletAddress: "not-a-key",
    });

    expect(http.patch).toHaveBeenCalledWith(
      "/core/platforms/platform-1/subjects/subject-1",
      { label: "Ada" },
    );
  });
});
