export interface SessionCheckData {
  implemented: boolean;
  stateFileExists: boolean;
  status: 'missing_state' | 'ready_for_browser_check';
  storageStatePath: string;
}

export interface SessionBootstrapData {
  implemented: boolean;
  prepared: boolean;
  storageStatePath: string;
  artifactsDir: string;
  next: string[];
}

export interface TripListItem {
  id: string;
  href: string;
  label: string;
}

export interface TripListData {
  implemented: boolean;
  baseUrl: string;
  tripsUrl: string;
  storageStatePath: string;
  hasStateFile: boolean;
  usingStorageState: boolean;
  pageKind: 'authenticated' | 'unauthenticated' | 'unknown';
  pageTitle: string;
  finalUrl: string;
  count: number;
  trips: TripListItem[];
}
