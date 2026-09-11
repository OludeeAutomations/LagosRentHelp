import { supabase } from "@/lib/supabase";

export interface TotpFactor {
  id: string;
  friendlyName: string;
  status: string;
  createdAt: string;
}

export interface TotpEnrollment {
  factorId: string;
  qrCode: string;
  secret: string;
}

const toQrSource = (qrCode: string) =>
  qrCode.trim().startsWith("<svg")
    ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(qrCode)}`
    : qrCode;

export const accountSecurityService = {
  listTotpFactors: async (): Promise<TotpFactor[]> => {
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) throw new Error(error.message);
    return (data.totp || []).map((factor) => ({
      id: factor.id,
      friendlyName: factor.friendly_name || "Authenticator app",
      status: factor.status,
      createdAt: factor.created_at,
    }));
  },

  requiresMfaChallenge: async (): Promise<boolean> => {
    const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (error) throw new Error(error.message);
    return data.nextLevel === "aal2" && data.currentLevel !== "aal2";
  },

  startTotpEnrollment: async (): Promise<TotpEnrollment> => {
    const { data: factorData, error: factorError } = await supabase.auth.mfa.listFactors();
    if (factorError) throw new Error(factorError.message);

    for (const factor of factorData.totp.filter((item) => item.status === "unverified")) {
      const { error } = await supabase.auth.mfa.unenroll({ factorId: factor.id });
      if (error) throw new Error(error.message);
    }

    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "LagosRentHelp",
    });
    if (error) throw new Error(error.message);

    return {
      factorId: data.id,
      qrCode: toQrSource(data.totp.qr_code),
      secret: data.totp.secret,
    };
  },

  verifyTotp: async (factorId: string, code: string): Promise<void> => {
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
    if (challengeError) throw new Error(challengeError.message);
    const { error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code: code.trim(),
    });
    if (error) throw new Error(error.message);
  },

  disableTotp: async (factorId: string, code: string): Promise<void> => {
    await accountSecurityService.verifyTotp(factorId, code);
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    if (error) throw new Error(error.message);
  },

  changePassword: async (newPassword: string): Promise<void> => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw new Error(error.message);
  },

  sendPasswordReset: async (email: string): Promise<void> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw new Error(error.message);
  },
};
