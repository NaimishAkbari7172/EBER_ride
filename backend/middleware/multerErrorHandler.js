const multer = require('multer');

const errorHandler = (err, req, res, next) => {
    console.log(">>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>")
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                success: false,
                message: "File size exceeds the limit (2MB).",
            });
        }
        return res.status(400).json({
            success: false,
            message: "Unexpected error while uploading the file.",
        });
    } else if (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
    next();
};

module.exports = errorHandler;