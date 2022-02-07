export const getTime = (
  dateString: string,
  issueWithTimeFormat: boolean,
  useLocalTimezone: boolean
): string => {
  if (!issueWithTimeFormat) {
    if (useLocalTimezone) {
      return new Date(dateString).toLocaleString(navigator.language)
    } else {
      return `${new Date(dateString).toLocaleString(navigator.language, {
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
