const cloudinary = require("../config/cloudinary");

// @route  POST /api/upload
// @desc   Upload a single image (property photo, blog cover, plan QR code,
//         or payment screenshot) to Cloudinary. Accepts multipart/form-data
//         with a field named "image". Any authenticated user can call this —
//         it doesn't attach the result to anything by itself; the caller
//         (property form, blog form, etc.) takes the returned url and saves
//         it wherever it belongs.
// @access Authenticated (any role)
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided (expected field name 'image')" });
    }

    const uploadFromBuffer = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "futurenest", resource_type: "image" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

    const result = await uploadFromBuffer();

    res.status(201).json({
      message: "Image uploaded",
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    res.status(500).json({ message: "Image upload failed", error: error.message });
  }
};

module.exports = { uploadImage };
