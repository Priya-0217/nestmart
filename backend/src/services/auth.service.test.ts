import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the Prisma client used by the service. We don't need a real DB.
const prismaMock = {
  user: {
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  session: {
    create: vi.fn(),
  },
};
vi.mock("../config/prisma.js", () => ({ prisma: prismaMock }));

// Email service is irrelevant to this test path — stub it out.
vi.mock("./email.service.js", () => ({
  sendOtpEmail: vi.fn(),
  sendWelcomeEmail: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  sendOrderConfirmationEmail: vi.fn(),
  sendShippingConfirmationEmail: vi.fn(),
}));

// Required env so tokens.ts (which imports env) is happy at module-load time.
process.env.JWT_ACCESS_SECRET ??= "test-access-secret-aaaaaaaaaaaaaaaaa";
process.env.JWT_REFRESH_SECRET ??= "test-refresh-secret-bbbbbbbbbbbbbbbb";
process.env.MONGODB_URI ??= "mongodb://localhost:27017/test";
process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/test";

const { loginWithGoogle } = await import("./auth.service.js");

const profile = {
  sub: "google-123",
  email: "alice@example.com",
  name: "Alice",
  picture: "https://lh3.googleusercontent.com/a/avatar",
  email_verified: true,
};
const verifier = vi.fn(async () => profile);

describe("loginWithGoogle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    verifier.mockResolvedValue(profile);
  });

  it("creates a new user when no Postgres row matches the Google account", async () => {
    prismaMock.user.findFirst.mockResolvedValue(null);
    const created = {
      id: "u1",
      email: profile.email,
      name: profile.name,
      role: "customer" as const,
      passwordHash: null,
      avatarUrl: profile.picture,
      phone: null,
      emailVerified: new Date(),
      isActive: true,
      googleId: profile.sub,
    };
    prismaMock.user.create.mockResolvedValue(created);
    prismaMock.user.update.mockResolvedValue(created);
    prismaMock.session.create.mockResolvedValue({});

    const result = await loginWithGoogle({ idToken: "tok", verifier });

    expect(verifier).toHaveBeenCalledWith("tok");
    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ email: profile.email, googleId: profile.sub }),
    });
    expect(result.user.email).toBe(profile.email);
    expect(result.accessToken).toMatch(/^eyJ/);
    expect(result.refreshToken).toMatch(/^eyJ/);
  });

  it("links googleId to an existing email-only account", async () => {
    const existing = {
      id: "u2",
      email: profile.email,
      name: "Old Name",
      role: "customer" as const,
      passwordHash: "$2a$12$hash",
      avatarUrl: null,
      phone: null,
      emailVerified: null,
      isActive: true,
      googleId: null,
    };
    prismaMock.user.findFirst.mockResolvedValue(existing);
    prismaMock.user.update.mockResolvedValue({ ...existing, googleId: profile.sub });
    prismaMock.session.create.mockResolvedValue({});

    await loginWithGoogle({ idToken: "tok", verifier });

    // First update is the linking call; second is the lastLoginAt bump.
    const linkCall = prismaMock.user.update.mock.calls[0]![0] as { data: { googleId: string } };
    expect(linkCall.data.googleId).toBe(profile.sub);
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  it("rejects an inactive account", async () => {
    prismaMock.user.findFirst.mockResolvedValue({
      id: "u3",
      email: profile.email,
      name: "Banned",
      role: "customer",
      passwordHash: null,
      avatarUrl: null,
      phone: null,
      emailVerified: new Date(),
      isActive: false,
      googleId: profile.sub,
    });

    await expect(loginWithGoogle({ idToken: "tok", verifier })).rejects.toThrow(/disabled/i);
    expect(prismaMock.session.create).not.toHaveBeenCalled();
  });
});
