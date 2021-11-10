export function hasExpertRole(userData: any): boolean {
  // Always return true ff auth is not enabled
  if (process.env.REACT_APP_AUTH !== '1') return true
  if (userData?.roles) {
    if (
      userData.roles.includes('EXPERT') ||
      userData.roles.includes('DMSS_ADMIN')
    ) {
      return true
    }
  }
  return false
}
