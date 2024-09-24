const multer= require("multer");
const path= require("path");


uploadMiddleware = (profile_path) => {

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, profile_path);
        },
    
        filename: function (req, file, cb) {
            const ext = path.extname(file.originalname);
            let fileName = file.originalname + '_' + Date.now() + ext;
            req.body.profile = fileName;
            cb(null, fileName)
        }
    });
    
    const filter = function (req, file, cb) {
        const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedExtensions.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error("Only JPG, JPEG, PNG, WEBP and GIF files are allowed."));
        }
    };
    
    const upload = multer({
        storage: storage,
        limits: {
            fileSize: 2 * 1024 * 1024
        },
        fileFilter: filter
    });

    return upload;
}    

module.exports = uploadMiddleware;