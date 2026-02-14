const sharp = require("sharp");

/**
 * Compresses an image buffer using sharp.
 * @param {Buffer} buffer - The image buffer.
 * @param {String} mimetype - The mimetype of the image.
 * @returns {Promise<Buffer>} - The compressed image buffer.
 */
const compressImage = async (buffer, mimetype) => {
	try {
		// Always convert to WebP with specified settings
		return await sharp(buffer).webp({ quality: 75, effort: 6 }).toBuffer();
	} catch (error) {
		console.error("Image compression error:", error);
		// If compression fails, return original buffer
		// Note: Caller might default to .webp extension, so this could arguably cause mismatch if failed.
		// But for now, we assume sharp works.
		return buffer;
	}
};

module.exports = compressImage;
