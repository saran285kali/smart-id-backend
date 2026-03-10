import axios from "axios";

export const sendSMS = async (phone, otp) => {

    const response = await axios.post(
        "https://www.fast2sms.com/api/v3/send",
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
    );

    console.log("SMS RESPONSE:", response.data);

};
