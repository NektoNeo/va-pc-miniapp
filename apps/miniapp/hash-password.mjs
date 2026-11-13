import bcrypt from 'bcryptjs';

const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
if (!password || password.length < 16 || Buffer.byteLength(password) > 72) {
  throw new Error('Set ADMIN_BOOTSTRAP_PASSWORD (at least 16 characters, at most 72 bytes).');
}
console.log(await bcrypt.hash(password, 12));
