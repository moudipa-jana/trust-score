/**
 * Checks whether all given parameters have a truthy value.
 * @param {...any} params - Any number of parameters to check.
 * @returns {boolean} - Returns true if all parameters are truthy, false otherwise.
 */
const isValid = (...params: unknown[]): boolean => {
  for (let i = 0; i < params.length; i++) {
    if (!params[i]) {
      return false;
    }
  }
  return true;
};

function countWords(str: string) {
  const arr = str.split(' ');
  return arr.filter((word) => word !== '').length;
}

/**
 * Checks whether the given string value contains at least the minimum number of words or characters.
 * @param {string} value - The string value to check.
 * @param {boolean} words - Optional flag indicating whether to count words (default) or characters.
 * @param {number} minimum - Optional minimum number of words or characters (default is 3).
 * @returns {boolean} - Returns true if the value contains at least the minimum number of words or characters, false otherwise.
 */
const minWordsOrChars = (value: string, words = true, minimum = 3) => {
  if (!value) {
    return false;
  }
  let valueToUse = value;
  if (typeof value !== 'string') {
    valueToUse = `${value}`;
  }
  if (!words) {
    return valueToUse.trim().length >= minimum;
  }

  const validLength = countWords(value) >= minimum;
  return validLength;
};

/**
*Returns the remaining number of characters or words that can be added to a given string
before reaching the specified limit.
*@param {string} str - The input string to check for remaining characters or words.
*@param {number} limit - The maximum limit of characters or words.
*@param {boolean} word - Whether to count words instead of characters. Defaults to false.
*@returns {number} The remaining number of characters or words that can be added to the string
before reaching the limit. If the limit has already been reached, 0 is returned.
*/

const getRemainingCharOrWordCount = (
  str: string,
  limit: number,
  word = false,
) => {
  let remainingCharCount;
  if (!word) {
    remainingCharCount = limit - str.length;
  } else {
    const words = str.trim().split(/\s+/);
    remainingCharCount = limit - words.length;
  }
  return remainingCharCount >= 0 ? remainingCharCount : -1;
};
/**
 * Checks if the given string value meets a word or character limit.
 * @param {string} value - The string value to check.
 * @param {number} limit - The maximum number of words or characters allowed.
 * @param {boolean} isCharacterLimit - Optional flag indicating whether the limit applies to characters instead of words.
 * @returns {boolean} - Returns true if the value meets the limit, false otherwise.
 */

const checkWordLimit = (
  value: string,
  limit: number,
  isCharacterLimit = false,
) => {
  if (isCharacterLimit && value.length > limit) {
    return false;
  }

  const words = value.trim().split(/\s+/);
  if (words.length > limit) {
    return false;
  }

  return true;
};

interface HasCategoryId {
  categoryId: string;
}

/**
 * Compares two objects and determines if their values are different.
 * @param obj1 - The first object to compare.
 * @param obj2 - The second object to compare.
 * @returns Returns true if the objects have different values, false otherwise.
 */

function isValidChange<T extends Record<string, unknown>>(
  obj1: T,
  obj2: T,
): boolean {
  const keys1 = Object.keys(obj1) as (keyof T)[];
  const keys2 = Object.keys(obj2) as (keyof T)[];

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (key === 'areaOfInterests') {
      const arr1 = obj1[key] as HasCategoryId[];
      const arr2 = obj2[key] as HasCategoryId[];

      const sortedArr1 = [...arr1].sort();
      const sortedArr2 = [...arr2].sort();

      const categoryIDs = sortedArr1.map((obj) => obj.categoryId);

      for (let i = 0; i < Math.max(sortedArr2.length, sortedArr1.length); i++) {
        if (!categoryIDs.includes(sortedArr2[i]?.categoryId)) {
          return true;
        }
      }

      return false;
    } else {
      if (obj1[key] !== obj2[key]) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Compares the old and updated values and returns a boolean indicating if they are different.
 * Supports comparison of strings, numbers, objects, and arrays.
 *
 * @param oldValue - The old value to compare.
 * @param updatedValue - The updated value to compare.
 * @returns A boolean indicating if the values are different (true) or similar (false).
 */

function compareChangeValue<T>(oldValue: T, updatedValue: T): boolean {
  if (typeof oldValue !== typeof updatedValue) {
    return true;
  }

  if (typeof oldValue === 'object' && typeof updatedValue === 'object') {
    return JSON.stringify(oldValue) !== JSON.stringify(updatedValue);
  }

  return oldValue !== updatedValue;
}

/**
 * Checks if the given string contains only allowed characters.
 * Allows alphanumeric characters, spaces, underscores, and hyphens.
 * @param {string} value - The string value to check.
 * @returns {boolean} - Returns true if the string contains only allowed characters, false otherwise.
 */
const isValidAliasName = (value: string): boolean => {
  if (!value) {
    return true; // Empty string is valid
  }
  // Regex pattern: allows letters, numbers, spaces, underscores, and hyphens
  const allowedPattern = /^[a-zA-Z0-9\s_-]+$/;
  return allowedPattern.test(value);
};

const validations = {
  isValid,
  minWordsOrChars,
  checkWordLimit,
  getRemainingCharOrWordCount,
  isValidChange,
  compareChangeValue,
  isValidAliasName,
};

export default validations;
