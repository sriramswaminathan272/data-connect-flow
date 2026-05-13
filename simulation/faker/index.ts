import { feastRunnerPM, feastRunnerAnalyst, feastRunnerMarketing } from "./swiggy-like.js";
import { bitVaultPM, bitVaultAnalyst, bitVaultMarketing } from "./coinswitch-like.js";
import { mediConnectPM, mediConnectAnalyst, mediConnectMarketing } from "./practo-like.js";
import { quickCartPM, quickCartAnalyst, quickCartMarketing } from "./flipkart-like.js";
import { swiftShipPM, swiftShipAnalyst, swiftShipMarketing } from "./delhivery-like.js";
import type { CompanyProfile } from "../types.js";

// 5 companies × 3 personas = 15 profiles
export const ALL_PROFILES: CompanyProfile[] = [
  feastRunnerPM, feastRunnerAnalyst, feastRunnerMarketing,
  bitVaultPM, bitVaultAnalyst, bitVaultMarketing,
  mediConnectPM, mediConnectAnalyst, mediConnectMarketing,
  quickCartPM, quickCartAnalyst, quickCartMarketing,
  swiftShipPM, swiftShipAnalyst, swiftShipMarketing,
];

export const COMPANY_KEYS = ["feastrunner", "bitvault", "mediconnect", "quickcart", "swiftship"] as const;
export type CompanyKey = (typeof COMPANY_KEYS)[number];

export function getCompanyProfiles(companyKey: CompanyKey): CompanyProfile[] {
  return ALL_PROFILES.filter((p) => p.companyKey === companyKey);
}
