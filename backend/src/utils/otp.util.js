import crypto from 'crypto'
import bcrypt from 'bcryptjs'

export const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString()
}

export const hashOtp = async (otp) => {
  return await bcrypt.hash(otp, 10)
}

export const verifyOtp = async (otp, hash) => {
  return await bcrypt.compare(otp, hash)
}
