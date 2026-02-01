import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
} from "../constants/cloud";

export const uploadToCloudinary = async (
  uri: string,
): Promise<string | null> => {
  if (!uri) return null;

  try {
    const data = new FormData();
    data.append("file", {
      uri,
      type: "image/jpeg", // Adjust if you need to support other types, or detect from uri
      name: "upload.jpg",
    } as any);
    data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    data.append("cloud_name", CLOUDINARY_CLOUD_NAME);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: data,
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
      },
    );

    const result = await response.json();
    if (result.secure_url) {
      return result.secure_url;
    } else {
      console.error("Cloudinary Upload Error:", result);
      return null;
    }
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    return null;
  }
};
