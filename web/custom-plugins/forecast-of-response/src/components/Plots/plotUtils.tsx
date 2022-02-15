export const getTime = (
  dateString: string,
  issueWithTimeFormat: boolean,
  useLocalTimezone: boolean
): string => {
  if (!issueWithTimeFormat) {
    let formatOptions: {} = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }
    if (useLocalTimezone) {
      return new Date(dateString).toLocaleString('en-GB', formatOptions)
    } else {
      return `${new Date(dateString).toLocaleString('en-GB', {
        ...formatOptions,
        timeZone: 'UTC',
      })}`
    }
  }
  return dateString
}

export const getDayFromDateString = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-us', {
    weekday: 'long',
  })
}

export function dayOfYear(date: string) {
  // Get the day of year, a number between 1 and 365 (364 for leap year)
  // source: https://stackoverflow.com/questions/8619879/javascript-calculate-the-day-of-the-year-1-366/8619946#8619946
  var now: Date = new Date(date)
  var start: Date = new Date(now.getFullYear(), 0, 0)
  //@ts-ignore
  var diff =
    now -
    start +
    (start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000
  var oneDay = 1000 * 60 * 60 * 24
  return Math.floor(diff / oneDay)
}
