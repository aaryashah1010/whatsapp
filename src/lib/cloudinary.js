import axios from 'axios';

export const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'chatapp'); // Replace with your preset name

    try {
        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/dhustd6cr/image/upload`, // Replace with your cloud name
            formData
        );
        return response.data.url; // Return the image URL
    } catch (error) {
        console.error('Error uploading image:', error);
        return null;
    }
};
