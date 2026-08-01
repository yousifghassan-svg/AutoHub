import { useMutation } from '@tanstack/react-query';
import { ApiError, type UpdateProfileInput } from '@/lib/api/types';
import { PhoneAuthError } from '../data/phone-auth.gateway';
import { useAuth } from '../context/AuthProvider';

function toMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof PhoneAuthError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Something went wrong';
}

export function useSendOtpMutation() {
  const { sendOtp } = useAuth();
  return useMutation({
    mutationFn: (phoneE164: string) => sendOtp(phoneE164),
    meta: { errorMapper: toMessage },
  });
}

export function useVerifyOtpMutation() {
  const { verifyOtp } = useAuth();
  return useMutation({
    mutationFn: (code: string) => verifyOtp(code),
  });
}

export function useCompleteProfileMutation() {
  const { completeProfile } = useAuth();
  return useMutation({
    mutationFn: (input: UpdateProfileInput) => completeProfile(input),
  });
}

export function useLogoutMutation() {
  const { logout } = useAuth();
  return useMutation({
    mutationFn: () => logout(),
  });
}

export { toMessage as mapAuthError };
