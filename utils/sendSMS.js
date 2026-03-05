import axios from "axios"

export const sendSMS = async (phone, otp) => {
    try {
        const response = await axios.post(
            "https://www.fast2sms.com/dev/bulkV2",
            {
                route: "otp",
                variables_values: otp,
                numbers: phone
            },
            {
                headers: {
                    authorization: process.env.FAST2SMS_API_KEY,
                    "Content-Type": "application/json"
                }
            }
        )

        console.log(response.data)
        return response.data

    } catch (error) {
        console.error(error.response?.data || error)
        throw new Error("SMS sending failed")
    }
}
