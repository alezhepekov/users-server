export interface User {
  id: number;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  dateOfBirth?: string;
  gender?: string;
  email: string;
  phone?: string;
  address?: string;
  password: string;
  accountType: string;
  data?: any;
  picture?: string;
  creationTime?: string;
  lastAccessTime?: string;
};
