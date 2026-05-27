import axios from 'axios';

export const sendNotification = async (patientId, message, token) => {
    try {
        await axios.post(`${process.env.NOTIFICATION_URL}/notifications`, {
            patientId,
            message
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
    } catch (error) {
        console.error(error.message);
    }
};