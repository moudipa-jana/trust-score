function findMissingHashtags(
  firstArray: string[],
  secondArray: string[],
): string[] {
  const missingHashtags: string[] = [];
  firstArray.forEach((string: string) => {
    if (!secondArray.includes(string)) {
      missingHashtags.push(string);
    }
  });
  return missingHashtags;
}

export default findMissingHashtags;
