import dayjs from 'dayjs';

/**
 * Backend is storing the dates without the timezone
 * We append a "z" to indicate that it's in the UTC format and format to indian time
 *
 * @param dateString - A string, number, Date object, or Day.js instance representing the date and time.
 * @returns A Day.js instance representing the input date and time.
 */
export default function appDayjs(
  dateString: string | number | Date | dayjs.Dayjs | null | undefined,
) {
  if (dateString && typeof dateString === 'string') {
    return dayjs.utc(dateString);
  }
  return dayjs(dateString);
}
