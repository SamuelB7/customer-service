export type CustomerAuthenticatedUser = {
  id: string;
  email: string;
  roles: string[];
};

export type CustomerAuthenticatedRequest = {
  headers: Record<string, string | string[] | undefined>;
  user: CustomerAuthenticatedUser;
};

