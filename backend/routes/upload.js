const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("../config/cloudinary");

const upload = multer({ dest: "uploads/" });

router.post("/upload-video", upload.single("video"), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "video"
    });

    res.json({
      success: true,
      url: result.secure_url
    });
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
});

module.exports = router;
