export function hasExpertRole(userData: any): boolean {
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
