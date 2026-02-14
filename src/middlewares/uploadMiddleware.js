const multer = require("multer");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const path = require("path");
const crypto = require("crypto");

// Cloudflare R2 Config
const r2 = new S3Client({
	region: "auto",
	endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
	credentials: {
		accessKeyId: process.env.R2_ACCESS_KEY_ID,
		secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
	},
});

// Multer Config (Memory Storage)
const storage = multer.memoryStorage();
const upload = multer({
	storage: storage,
	limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
	fileFilter: (_, file, cb) => {
		const filetypes = /jpeg|jpg|png|webp/;
		const mimetype = filetypes.test(file.mimetype);
		const extname = filetypes.test(
			path.extname(file.originalname).toLowerCase(),
		);

		if (mimetype && extname) {
			return cb(null, true);
		}
		cb(
			new Error(
				"Error: File upload only supports the following filetypes - " +
					filetypes,
			),
		);
	},
});

const uploadMiddleware = (req, res, next) => {
	const uploadSingle = upload.array("images", 4);

	uploadSingle(req, res, async (err) => {
		if (err) {
			return res.status(400).json({ message: err.message });
		}

		try {
			const files = req.files;
			const uploadedUrls = [];
			if (files && files.length > 0) {
				const compressImage = require("../helpers/imageCompression");
				const uploadPromises = files.map(async (file) => {
					// Compress image before upload
					const compressedBuffer = await compressImage(
						file.buffer,
						file.mimetype,
					);

					const fileName = `${crypto.randomBytes(16).toString("hex")}.webp`;

					const command = new PutObjectCommand({
						Bucket: process.env.R2_BUCKET_NAME,
						Key: fileName,
						Body: compressedBuffer, // Use compressed buffer
						ContentType: "image/webp",
					});

					await r2.send(command);

					// Construct public URL
					const publicUrl = process.env.R2_PUBLIC_URL
						? `${process.env.R2_PUBLIC_URL.replace(/\/$/, "")}/${fileName}`
						: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${process.env.R2_BUCKET_NAME}/${fileName}`;

					return publicUrl;
				});

				const urls = await Promise.all(uploadPromises);
				uploadedUrls.push(...urls);
			}

			// Attach uploaded URLs to req.body.polaroid
			// Current controller expects req.body.polaroid to be an array or part of the body
			// We'll simulate the structure expected by the controller/model

			// If the frontend sends other fields as JSON strings in formData, we might need to parse them
			// But usually multer populates req.body with text fields automatically.

			// NOTE: The controller expects `polaroid` to be an array of strings.
			// We replace whatever was in `polaroid` (if anything) with the new URLs.
			// If the user didn't upload any images, we might want to keep existing logic or handle empty array.

			if (uploadedUrls.length > 0) {
				req.body.polaroid = uploadedUrls;
			} else {
				// If no files uploaded, check if polaroid was sent as text (e.g. empty strings)
				// If not, default to empty array
				if (!req.body.polaroid) req.body.polaroid = [];
			}

			next();
		} catch (error) {
			console.error("Upload Middleware Error:", error);
			return res
				.status(500)
				.json({ message: "Image upload failed", error: error.message });
		}
	});
};

module.exports = uploadMiddleware;
