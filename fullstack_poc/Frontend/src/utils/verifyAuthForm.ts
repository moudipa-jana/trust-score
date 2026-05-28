import { WEAK_PASSWORDS_VALIDaTION_LIST } from '@/lib/constants';

export function required(value: unknown): string | undefined {
  return value ? undefined : '*Required';
}

function validateEmail(email: string, dbCheck?: boolean): string | undefined {
  if (!dbCheck) {
    if (!email) {
      return '*Required';
    } else if (
      !/^(?!.*\.\.)(?!.*\.-)(?!.*-\.)[a-zA-Z0-9._%+-]+@(?!.*\.\.)[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z]{2,})+$/i.test(
        email,
      ) &&
      email
    ) {
      return 'Invalid email address';
    }
  }
}

function passwordRegexValidator(password: string): boolean {
  const passwordRegex =
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*~_]).{8,}$/;
  return passwordRegex.test(password);
}

function validatePassword(password: string): string | undefined {
  if (!password) {
    return '*Required';
  } else if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  } else if (!passwordRegexValidator(password)) {
    return 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
  }
  return undefined;
}

function validateConfirmPassword(
  confirmPassword: string,
  password: string,
): string | undefined {
  if (!confirmPassword) {
    return '*Required';
  } else if (password !== confirmPassword) {
    return 'Password must be matched with above password';
  }
}

///////Enforce Password Validation ///////

function passwordRegexValidatorEnforce(password: string): boolean {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
  return passwordRegex.test(password);
}

function isWeakPassword(password: string): boolean {
  const lower = password.toLowerCase();
  return WEAK_PASSWORDS_VALIDaTION_LIST.some((weak) => lower.includes(weak));
}

function hasRepeatedCharacters(password: string): boolean {
  return /(.)\1{4,}/.test(password);
}

/* ----------- Main Enforce Password Validation (Updated) ----------- */
function validatePasswordEnforce(password: string): string | undefined {
  if (!password) return '*Required';

  if (password.length < 12)
    return 'Password must be at least 12 characters long';

  if (!passwordRegexValidatorEnforce(password))
    return 'Password must include uppercase, lowercase, number, and special character';

  if (isWeakPassword(password))
    return 'Password is too common or easily guessable. Please choose a stronger password';

  if (hasRepeatedCharacters(password))
    return 'Password contains repeated characters (e.g., aaaaa, 11111). Not allowed';

  return undefined;
}

/////

export const validateForm = {
  email: validateEmail,
  password: validatePassword,
  enforcePassword: validatePasswordEnforce,
  confirmPassword: validateConfirmPassword,
  required: required,
};
