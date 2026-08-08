import cloudinary from '../utils/cloudinary.js';

// Retry upload up to 3 times with a timeout
const uploadWithRetry = async (image, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await cloudinary.uploader.upload(image, {
        folder: 'the-cargo-grid/packages',
        transformation: [{ width: 800, height: 800, crop: 'limit' }],
        timeout: 60000, // 60 seconds
      });
      return result;
    } catch (err) {
      console.error(`Cloudinary upload attempt ${attempt} failed:`, err.message);
      if (attempt === retries) throw err;
      // Wait 1 second before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
};

export const uploadPackageImage = async (req, res, next) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ message: 'No image provided' });
    }

    console.log('📤 Uploading image to Cloudinary...');
    const result = await uploadWithRetry(image);

    res.status(200).json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (err) {
    console.error('❌ Cloudinary upload error:', err.message);
    res.status(500).json({
      message: 'Image upload failed',
      error: err.message,
    });
  }
};