
export interface WhoisResult {
  ip: string;
  summary: string;
  networkInfo: {
    name?: string;
    organization?: string;
    netRange?: string;
    cidr?: string;
    status?: string;
    registry?: string;
  };
  geography: {
    country?: string;
    city?: string;
    coordinates?: string;
  };
  contacts: {
    abuse?: string;
    admin?: string;
  };
  sources: {
    title: string;
    uri: string;
  }[];
}

export interface SearchHistoryItem {
  ip: string;
  timestamp: number;
}
