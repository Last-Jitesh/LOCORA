import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import OtpRequest from '../models/OtpRequest';

const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 5;

/** Generate a random 6-digit OTP, hash it, store in DB. Returns the plain OTP for emailing. */
export const generateAndStoreOtp = async (email: string): Promise<string> => {
  // Invalidate any existing OTPs for this email
  await OtpRequest.deleteMany({ email: email.toLowerCase() });

  const otp = crypto.randomInt(100000, 999999).toString();
  const salt = await bcrypt.genSalt(10);
  const otpHash = await bcrypt.hash(otp, salt);

  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await OtpRequest.create({ email: email.toLowerCase(), otpHash, expiresAt });

  return otp;
};

/** Validate an OTP submission. Returns true on success, throws on failure. */
export const validateOtp = async (email: string, otp: string): Promise<void> => {
  const record = await OtpRequest.findOne({ email: email.toLowerCase() }).sort({ createdAt: -1 });

  if (!record) {
    throw new Error('No OTP found. Please request a new one.');
  }

  if (record.expiresAt < new Date()) {
    await OtpRequest.deleteOne({ _id: record._id });
    throw new Error('OTP has expired. Please request a new one.');
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    await OtpRequest.deleteOne({ _id: record._id });
    throw new Error('Too many incorrect attempts. Please request a new OTP.');
  }

  const isMatch = await bcrypt.compare(otp, record.otpHash);

  if (!isMatch) {
    await OtpRequest.findByIdAndUpdate(record._id, { $inc: { attempts: 1 } });
    const remaining = MAX_ATTEMPTS - (record.attempts + 1);
    throw new Error(`Incorrect OTP. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`);
  }

  // Success — delete the used OTP
  await OtpRequest.deleteOne({ _id: record._id });
};
