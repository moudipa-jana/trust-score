export function required(value: unknown): string | undefined {
  return value ? undefined : '*Required';
}

function validateEmail(email: string, dbCheck?: boolean): string | undefined {
  if (!dbCheck) {
    if (!email) {
      return '*Required';
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email) &&
      email
    ) {
      return 'Invalid email address';
    }
  }
}

function validateText(fullName: string) {
  if (!fullName || fullName.trim().length === 0) {
    return '*Required';
  }
}

function validatePhoneNumber(phoneNumber: string) {
  if (!phoneNumber) {
    return '*Required';
  } else if (!/^[0-9]+$/.test(phoneNumber)) return 'Must only contain numbers';
  else if (phoneNumber.length !== 10) {
    return 'Must be 10 characters';
  }
}

function validateZipCode(zCode: string) {
  if (!/^[0-9]+$/.test(zCode)) {
    if (zCode !== '') return 'Must only contain numbers';
  }
  if (zCode.length !== 6) {
    if (zCode !== '') return 'Must contain 6 digits';
  }
}

function validateName(name: string) {
  if (!name || name.trim().length === 0) {
    return '*Required';
  }

  if (!/^[A-Za-z\s'-]+$/.test(name)) {
    return 'Name can not contain numbers or special characters';
  }

  if (name.trim().length < 2) {
    return 'Name must be at least 2 characters long';
  }
}

function validateMiddleName(name: string) {
  const trimmedName = name.trim();

  if (trimmedName === '') {
    return;
  }

  if (!/^[A-Za-z\s'-]+$/.test(name)) {
    return 'Name can not contain numbers or special characters';
  }

  if (trimmedName.length < 2) {
    return 'Name must be at least 2 characters long';
  }
}

export const validateForm = {
  email: validateEmail,
  text: validateText,
  name: validateName,
  middleName: validateMiddleName,
  phoneNumber: validatePhoneNumber,
  zipCode: validateZipCode,
  required: required,
};
