import bcrypt from "bcryptjs";

import { User } from "../users/user.model.js";
import type {
  AuthUser,
  LoginInput,
  RegisterInput
} from "./auth.types.js";
import { generateAccessToken } from "../../utils/jwt.js";

function sanitizeUser(
  user: {
    _id: unknown;
    name: string;
    email: string;
    role: "user" | "admin";
  }
): AuthUser {
  return {
    _id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role
  };
}

export async function registerUser(
  input: RegisterInput
): Promise<{
  user: AuthUser;
  token: string;
}> {
  const existingUser = await User.findOne({
    email: input.email
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(
    input.password,
    12
  );

  const user = await User.create({
    name: input.name,
    email: input.email,
    password: hashedPassword,
    role: "user"
  });

  const token = generateAccessToken(
    String(user._id)
  );

  return {
    user: sanitizeUser(user),
    token
  };
}

export async function loginUser(
  input: LoginInput
): Promise<{
  user: AuthUser;
  token: string;
}> {
  const user = await User.findOne({
    email: input.email
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(
    input.password,
    user.password
  );

  if (!passwordMatches) {
    throw new Error("Invalid email or password");
  }

  const token = generateAccessToken(
    String(user._id)
  );

  return {
    user: sanitizeUser(user),
    token
  };
}

export async function getUserById(
  userId: string
): Promise<AuthUser | null> {
  const user = await User.findById(userId);

  if (!user) {
    return null;
  }

  return sanitizeUser(user);
}
