import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";

export class AuthService {
  private static readonly MOCK_ADMIN = {
    username: process.env.ADMIN_USERNAME || "",
    password: process.env.ADMIN_PASSWORD || "",
  };

  async register(username: string, password: string) {
    if (username !== AuthService.MOCK_ADMIN.username) {
      throw new Error(
        "Registration not allowed. Only admin account is permitted."
      );
    }
    if (await bcrypt.compare(password, AuthService.MOCK_ADMIN.password)) {
      throw new Error("Admin account already exists.");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    AuthService.MOCK_ADMIN.password = hashedPassword;
    return { message: "Admin registered successfully" };
  }

  async login(username: string, password: string) {
    if (
      username !== AuthService.MOCK_ADMIN.username ||
      !(await bcrypt.compare(password, AuthService.MOCK_ADMIN.password))
    ) {
      throw new Error("Invalid credentials");
    }
    const token = jwt.sign(
      { id: 1, username: AuthService.MOCK_ADMIN.username },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1h" }
    );
    return { token };
  }
}
