
import { wishoniaNavigation } from "./domains/wishonia-nav"
import { DomainNavigation, NavigationConfig } from "./nav-types"

export const navigationConfig: NavigationConfig = {
  "wishonia.love": wishoniaNavigation,
}

export function getNavigationForDomain(domain: string): DomainNavigation {
  return navigationConfig[domain] || navigationConfig["wishonia.love"]
}
