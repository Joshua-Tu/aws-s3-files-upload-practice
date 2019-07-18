// route/api/profile.js
const express = require("express");
const aws = require("aws-sdk");
const multerS3 = require("multer-s3");
const multer = require("multer");
const path = require("path");

/**
 * express.Router() creates modular, mountable route handlers
 * A Router instance is a complete middleware and routing system; for this reason, it is often referred to as a “mini-app”.
 */
const router = express.Router();

/**
 * File/ Files STORING STARTS
 */
const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  Bucket: "proudsmarts3bucket"
});

/**
 * Profile Image Upload starts - single file Upload
 */
const profileImgUpload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "proudsmarts3bucket/profile_pictures",
    acl: "public-read",
    key: function(req, file, cb) {
      cb(
        null,
        path.basename(file.originalname, path.extname(file.originalname)) +
          "-" +
          Date.now() +
          path.extname(file.originalname)
      );
    }
  }),
  limits: { fileSize: 2000000 }, // Set limite of the file you want to upload, in bytes: 2000000 bytes = 2 MB
  fileFilter: function(req, file, cb) {
    checkImgFileType(file, cb);
  }
}).single("profileImage");

// Check File Type
// @param file
// @param cb
// @return {*}

function checkImgFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  /**  Check mime
   * A MIME type is a label used to identify a type of data. It is used so software can know how to handle the data. It serves the same purpose on the Internet that file extensions do on Microsoft Windows.
   * So if a server says "This is text/html" the client can go "Ah, this is an HTML document, I can render that internally", while if the server says "This is application/pdf" the client can go "Ah, I need to launch the FoxIt PDF Reader plugin that the user has installed and that has registered itself as the application/pdf handler."
   */
  const mimetype = filetypes.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images Only!");
  }
}

// @route POST api/profile/business-img-upload
// @desc Upload post image
// @access public

router.post("/profile-img-upload", (req, res) => {
  profileImgUpload(req, res, error => {
    console.log("requestOkokok", req.file);
    console.log("error", error);
    if (error) {
      console.log("errors", error);
      res.json({ error: error });
    } else {
      // If File not found
      // undefined means the file name is not present
      if (req.file === undefined) {
        console.log("Error: No File Selected!");
        res.json("Error: No File Selected");
      } else {
        // If Success here is the profile picture name, and the url of the picture file in s3 bucket.
        const imageName = req.file.key;
        const imageLocation = req.file.location;
        // Save the file name into database into profile model
        res.json({
          image: imageName,
          location: imageLocation
        });
      }
    }
  });
});

/**
 * BUSINESS GALLERY IMAGES
 * MULTIPLE FILE UPLOADS
 */
// Multiple File Uploads ( max 4 )
const uploadsBusinessGallery = multer({
  storage: multerS3({
    s3: s3,
    bucket: "proudsmarts3bucket/documents",
    acl: "public-read",
    key: function(req, file, cb) {
      cb(
        null,
        path.basename(file.originalname, path.extname(file.originalname)) +
          "-" +
          Date.now() +
          path.extname(file.originalname)
      );
    }
  }),
  limits: { fileSize: 2000000 }, // In bytes: 2000000 bytes = 2 MB
  fileFilter: function(req, file, cb) {
    checkImgFileType(file, cb);
  }
}).array("galleryImage", 4); //we can change this 4 to any number, like how many files you wanna upload, or deleted the number so that we can upload numerous files we want.
/************* */
/// @route POST /api/profile/business-gallery-upload
/// @desc Upload business Gallery images
/// @access public
/***** */
router.post("/multiple-file-upload", (req, res) => {
  uploadsBusinessGallery(req, res, error => {
    console.log("files", req.files);
    if (error) {
      console.log("errors", error);
      res.json({ error: error });
    } else {
      // If File not found
      if (req.files === undefined) {
        console.log("Error: No File Selected!");
        res.json("Error: No File Selected");
      } else {
        // If Success
        let fileArray = req.files,
          fileLocation;
        const galleryImgLocationArray = [];
        for (let i = 0; i < fileArray.length; i++) {
          fileLocation = fileArray[i].location;
          console.log("file_url", fileLocation);
          galleryImgLocationArray.push(fileLocation);
        }
        // Save the file name into database
        res.json({
          filesArray: fileArray,
          locationArray: galleryImgLocationArray
        });
      }
    }
  });
});

/*******
 * Single video file upload starts here
 ******/
const videoUpload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "proudsmarts3bucket/videos",
    acl: "public-read",
    key: function(req, file, cb) {
      cb(
        null,
        path.basename(file.originalname, path.extname(file.originalname)) +
          "-" +
          Date.now() +
          path.extname(file.originalname)
      );
    }
  }),
  //size in bytes: 2000000 bytes = 2 MB, comment the limits if you don't wanna set limits for you file.
  limits: { fileSize: 200000000 },
  fileFilter: function(req, file, cb) {
    checkVideoFileType(file, cb);
  }
}).single("singleVideo");

/**
 * checkVideoFileType
 */
function checkVideoFileType(file, cb) {
  // Allowed ext, only allow mp4 video to be uploaded
  const filetypes = /mp4/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  /**  Check mime
   * A MIME type is a label used to identify a type of data. It is used so software can know how to handle the data. It serves the same purpose on the Internet that file extensions do on Microsoft Windows.
   * So if a server says "This is text/html" the client can go "Ah, this is an HTML document, I can render that internally", while if the server says "This is application/pdf" the client can go "Ah, I need to launch the FoxIt PDF Reader plugin that the user has installed and that has registered itself as the application/pdf handler."
   */
  const mimetype = filetypes.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: A single mp4 video Only!");
  }
}
///////////
//this 'single-video-uplaod' will be used in Component
router.post("/single-video-upload", (req, res) => {
  videoUpload(req, res, error => {
    console.log("requestOkokok", req.file);
    console.log("error", error);
    if (error) {
      console.log("errors", error);
      res.json({ error: error });
    } else {
      // If File not found
      // undefined means the file name is not present
      if (req.file === undefined) {
        console.log("Error: No File Selected!");
        res.json("Error: No File Selected");
      } else {
        // If Success here is the profile picture name, and the url of the picture file in s3 bucket.
        const videoName = req.file.key;
        const videoLocation = req.file.location;
        // Save the file name into database into profile model
        res.json({
          video: videoName,
          location: videoName
        });
      }
    }
  });
});
// We export the router so that the server.js file can pick it up
module.exports = router;
