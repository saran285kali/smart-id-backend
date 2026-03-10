import axios from "axios";

export const sendSMS = async (phone, otp) => {
    try {

        const response = await axios.get(
            "https://www.fast2sms.com/dev/bulkV2",
            {
                params: {
                    authorization: process.env.FAST2SMS_API_KEY,
                    route: "otp",
                    variables_values: otp,
                    numbers: phone
                }
            }
        );

        console.log("FAST2SMS RESPONSE:", response.data);

        if (!response.data.return) {
            throw new Error("SMS sending failed");
        }

    } catch (error) {
        console.log("FAST2SMS ERROR ↓↓↓");
        console.log(error.response?.data || error.message);
        throw new Error("SMS sending failed");
    }
};
