export interface IUser {
  email: string;
  name: string;
  password: string;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
}