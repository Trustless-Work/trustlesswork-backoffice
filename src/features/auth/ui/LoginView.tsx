"use client";

import { useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { AuthDivider } from "@/components/ui/auth-divider";
import { AuthPageLayout } from "@/components/shared/AuthPageLayout";
import { WalletLoginButton } from "@/features/auth/ui/WalletLoginButton";
import { RegisterForm } from "@/features/auth/ui/RegisterForm";
import { useWalletAuth } from "@/features/auth/hooks/useWalletAuth";

export const LoginView = () => {
  const {
    phase,
    needsRegister,
    pendingAddress,
    handleLogin,
    registerWithWallet,
    resetAuthFlow,
    isLoading,
    sessionExpiredReason,
  } = useWalletAuth();

  useEffect(() => {
    if (!sessionExpiredReason) {
      return;
    }

    toast.info("Session expired", {
      description:
        "Your session ended for security. Connect your wallet again to sign in.",
    });
  }, [sessionExpiredReason]);

  return (
    <AuthPageLayout>
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-wide">
          {needsRegister ? "Create your Account" : "Sign in to Trustless Work"}
        </h1>
        <p className="text-base text-muted-foreground">
          {needsRegister
            ? "Your wallet is connected. Finish registration to access the dashboard."
            : sessionExpiredReason
              ? "Your previous session expired. Connect your wallet to sign in again."
              : "Connect your Stellar wallet to sign in or register."}
        </p>
      </div>

      {!needsRegister ? (
        <WalletLoginButton
          phase={phase}
          isLoading={isLoading}
          onLogin={() => {
            void handleLogin();
          }}
        />
      ) : null}

      {needsRegister && pendingAddress ? (
        <RegisterForm
          walletAddress={pendingAddress}
          onRegister={registerWithWallet}
          onTryDifferentWallet={() => {
            void resetAuthFlow();
          }}
          isSubmitting={isLoading}
        />
      ) : (
        <>
          <AuthDivider>How it works</AuthDivider>
          <p className="text-start text-xs text-muted-foreground">
            SEP-10 signing verifies your wallet. New wallets register after
            connecting.
          </p>
        </>
      )}

      <p className="mt-4 text-sm text-muted-foreground">
        By continuing, you agree to our{" "}
        <Link
          className="underline underline-offset-4 hover:text-primary"
          href="/"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          className="underline underline-offset-4 hover:text-primary"
          href="/"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </AuthPageLayout>
  );
};
