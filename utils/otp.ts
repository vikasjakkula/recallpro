const OTP_API_BASE = 'https://cpaas.messagecentral.com/verification/v3'
const AUTH_TOKEN = process.env.OTP_AUTH_TOKEN
const CUSTOMER_ID = process.env.OTP_CUSTOMER_ID

export async function sendOTP(phoneNumber: string): Promise<{
  success: boolean
  verificationId?: string
  error?: string
}> {
  try {
    const response = await fetch(
      `${OTP_API_BASE}/send?countryCode=91&customerId=${CUSTOMER_ID}&flowType=SMS&mobileNumber=${phoneNumber}`,
      {
        method: 'POST',
        headers: {
          'authToken': AUTH_TOKEN!
        }
      }
    )

    const data = await response.json()
    
    if (data.responseCode === 200) {
      return {
        success: true,
        verificationId: data.data.verificationId
      }
    }
    
    return {
      success: false,
      error: data.message || 'Failed to send OTP'
    }
  } catch (error) {
    return {
      success: false,
      error: 'Failed to send OTP'
    }
  }
}

export async function verifyOTP(phoneNumber: string, verificationId: string, code: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const response = await fetch(
      `${OTP_API_BASE}/validateOtp?countryCode=91&mobileNumber=${phoneNumber}&verificationId=${verificationId}&customerId=${CUSTOMER_ID}&code=${code}`,
      {
        method: 'GET',
        headers: {
          'authToken': AUTH_TOKEN!
        }
      }
    )

    const data = await response.json()
    
    if (data.responseCode === 200 && data.data.verificationStatus === 'VERIFICATION_COMPLETED') {
      return {
        success: true
      }
    }
    
    return {
      success: false,
      error: data.message || 'Invalid OTP'
    }
  } catch (error) {
    return {
      success: false,
      error: 'Failed to verify OTP'
    }
  }
} 