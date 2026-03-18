import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      plan: string
      onboardingDone: boolean
      isActive: boolean
      planExpiresAt?: Date | null
    }
  }

  interface User {
    id: string
    plan?: string
    onboardingDone?: boolean
    isActive?: boolean
    planExpiresAt?: Date | null
  }
}
