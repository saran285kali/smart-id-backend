import axios from "axios";

export const sendSMS = async (phone, otp) => {
    try {
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

        console.log("FAST2SMS SUCCESS:", response.data);

        return response.data;

    } catch (error) {
        console.log("FAST2SMS ERROR ↓↓↓");

        if (error.response) {
            console.log(error.response.data);
        } else {
            console.log(error.message);
        }

        throw new Error("SMS sending failed");
    }
};
