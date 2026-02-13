const express = require("express");
const router = express.Router();
const multer = require("multer");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const path = require("path");
const crypto = require("crypto");
const successResponse = require("../helpers/successResponse");

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
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(
            path.extname(file.originalname).toLowerCase()
        );

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error("Error: File upload only supports the following filetypes - " + filetypes));
    },
});

router.post("/", upload.array("images", 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "No files uploaded" });
        }

        const uploadPromises = req.files.map(async (file) => {
            const fileExtension = path.extname(file.originalname);
            const fileName = `${crypto.randomBytes(16).toString("hex")}${fileExtension}`;
            
            const command = new PutObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME,
                Key: fileName,
                Body: file.buffer,
                ContentType: file.mimetype,
            });

            await r2.send(command);

            // Construct public URL
            // Assuming R2_PUBLIC_URL is the custom domain or R2.dev URL
            // If R2_PUBLIC_URL ends with slash, don't add another
            const publicUrl = process.env.R2_PUBLIC_URL 
                ? `${process.env.R2_PUBLIC_URL.replace(/\/$/, "")}/${fileName}`
                : `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${process.env.R2_BUCKET_NAME}/${fileName}`; // Fallback, likely not public accessible without custom domain

            return publicUrl;
        });

        const uploadedUrls = await Promise.all(uploadPromises);

        return successResponse(res, 200, uploadedUrls, "Successfully uploaded images");
    } catch (error) {
        console.error("Upload Error:", error);
        return res.status(500).json({ message: "Upload failed", error: error.message });
    }
});

module.exports = router;
