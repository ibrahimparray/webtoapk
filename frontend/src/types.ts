export interface BuildRequest {
  siteUrl: string;
  appName: string;
  packageName: string;
  icon?: File;
}

export interface BuildStatus {
  isBuilding: boolean;
  logs: string[];
  downloadUrl: string | null;
  error: string | null;
}

export interface ValidationErrors {
  siteUrl?: string;
  appName?: string;
  packageName?: string;
}
