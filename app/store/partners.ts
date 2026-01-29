import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Partner {
  id: string;
  name: string;
  logo: string;
  description: string;
  type: "savings" | "investments" | "pensions" | "insurance";
  features: string[];
  minAmount: number;
  returns?: string;
  connected: boolean;
}

interface PartnersState {
  partners: Partner[];
  connectPartner: (partnerId: string) => void;
  disconnectPartner: (partnerId: string) => void;
  getPartnersByType: (type: Partner["type"]) => Partner[];
  getConnectedPartners: (type?: Partner["type"]) => Partner[];
}

const defaultPartners: Partner[] = [
  // Savings Partners
  {
    id: "piggyvest",
    name: "Piggyvest",
    logo: "/piggyvest.png",
    description: "Nigeria's leading savings platform. Save automatically and earn up to 10% annually.",
    type: "savings",
    features: ["Auto-save", "Target savings", "Flex withdrawals", "Up to 10% returns"],
    minAmount: 100,
    returns: "8-10% p.a.",
    connected: false,
  },
  {
    id: "cowrywise",
    name: "Cowrywise",
    logo: "/cowrywise.png",
    description: "Save and invest with ease. Regulated by SEC Nigeria.",
    type: "savings",
    features: ["Goal-based savings", "Auto-invest", "Dollar savings", "Up to 12% returns"],
    minAmount: 100,
    returns: "10-12% p.a.",
    connected: false,
  },
  {
    id: "kuda",
    name: "Kuda Bank",
    logo: "/kuda.png",
    description: "The money app for Africans. Free transfers, savings, and budgeting.",
    type: "savings",
    features: ["Spend + Save", "Free transfers", "Budget tracking", "Instant access"],
    minAmount: 0,
    returns: "4% p.a.",
    connected: false,
  },
  // Investment Partners
  {
    id: "stanbic-mmf",
    name: "Stanbic IBTC MMF",
    logo: "/stanbic.jpeg",
    description: "Money Market Fund offering stable returns with daily liquidity.",
    type: "investments",
    features: ["Daily liquidity", "Low risk", "Professional management", "SEC regulated"],
    minAmount: 5000,
    returns: "12-15% p.a.",
    connected: false,
  },
  {
    id: "gtfm-mmf",
    name: "GT Fund Managers MMF",
    logo: "/gtbank.png",
    description: "Invest in money market instruments for competitive returns.",
    type: "investments",
    features: ["Capital preservation", "Competitive yields", "Easy redemption", "Trusted brand"],
    minAmount: 10000,
    returns: "13-16% p.a.",
    connected: false,
  },
  {
    id: "risevest",
    name: "Risevest",
    logo: "/risevest.png",
    description: "Invest in US stocks, real estate, and fixed income from Nigeria.",
    type: "investments",
    features: ["US stocks", "Real estate", "Fixed income", "Dollar returns"],
    minAmount: 10,
    returns: "10-30% p.a.",
    connected: false,
  },
  {
    id: "bamboo",
    name: "Bamboo",
    logo: "/bamboo.jpeg",
    description: "Trade US stocks commission-free. Own pieces of your favorite companies.",
    type: "investments",
    features: ["US stocks", "Fractional shares", "Zero commission", "Real-time trading"],
    minAmount: 20,
    returns: "Variable",
    connected: false,
  },
  // Pensions Partners (Coming Soon)
  {
    id: "arm-pension",
    name: "ARM Pension",
    logo: "https://www.armpension.com/images/arm-logo.svg",
    description: "Secure your retirement with one of Nigeria's leading pension managers.",
    type: "pensions",
    features: ["RSA management", "Voluntary contributions", "Retirement planning"],
    minAmount: 0,
    connected: false,
  },
  {
    id: "stanbic-pension",
    name: "Stanbic IBTC Pension",
    logo: "https://www.stanbicibtc.com/standimg/Nigeria/images/stanbic-logo-blue.svg",
    description: "Professional pension fund management for your future.",
    type: "pensions",
    features: ["Multi-fund structure", "Online access", "Expert management"],
    minAmount: 0,
    connected: false,
  },
  // Insurance Partners (Coming Soon)
  {
    id: "axa-mansard",
    name: "AXA Mansard",
    logo: "https://www.axamansard.com/images/axa-logo.svg",
    description: "Comprehensive insurance solutions for life, health, and property.",
    type: "insurance",
    features: ["Life insurance", "Health insurance", "Auto insurance"],
    minAmount: 0,
    connected: false,
  },
  {
    id: "leadway",
    name: "Leadway Assurance",
    logo: "https://www.leadway.com/images/leadway-logo.svg",
    description: "Trusted insurance partner for individuals and businesses.",
    type: "insurance",
    features: ["Life cover", "Health plans", "Asset protection"],
    minAmount: 0,
    connected: false,
  },
];

export const usePartnersStore = create<PartnersState>()(
  persist(
    (set, get) => ({
      partners: defaultPartners,
      connectPartner: (partnerId) =>
        set((state) => ({
          partners: state.partners.map((p) =>
            p.id === partnerId ? { ...p, connected: true } : p
          ),
        })),
      disconnectPartner: (partnerId) =>
        set((state) => ({
          partners: state.partners.map((p) =>
            p.id === partnerId ? { ...p, connected: false } : p
          ),
        })),
      getPartnersByType: (type) => get().partners.filter((p) => p.type === type),
      getConnectedPartners: (type) =>
        get().partners.filter((p) => p.connected && (type ? p.type === type : true)),
    }),
    {
      name: "kore-partners",
      version: 2,
      migrate: (persistedState, version) => {
        if (version < 2) {
          // Reset to default partners with new local logos
          return { partners: defaultPartners };
        }
        return persistedState as PartnersState;
      },
    }
  )
);
