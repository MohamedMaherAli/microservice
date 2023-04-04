import bcrypt from 'bcrypt';
export class Password {
  static async toHash(password: string) {
    const saltRounds = 8;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  }

  static async compare(suppliedPassword: string, storedPassword: string) {
    const match = await bcrypt.compare(suppliedPassword, storedPassword);
    return match;
  }
}
