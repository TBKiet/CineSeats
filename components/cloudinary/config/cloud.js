// // require('dotenv').config();
// const cloudinary = require('cloudinary').v2;
// // const {CloudinaryStorage} = require('multer-storage-cloudinary')

// cloudinary.config({
//     cloud_name: 'djupm4v0l',
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET,
// });
// // GET LINK
// // const url = cloudinary.url('mity_nigfdk')
// // console.log(url);

// /*GET FROM CLOUDINARY*/
// // const url = cloudinary.url('venom_onjdlu')
// // console.log(url);

// /*SEND TO CLOUDINARY*/
// // (async function(){
// //     const result = await cloudinary.uploader.upload('./public/images/venom.png');
// //     const url = cloudinary.url(result.public_id, {
// //       transformation: [
// //           {
// //               quality: 'auto',
// //               fetch_format: 'auto',
// //           },
// //           {
// //               width: 1200,
// //               height: 1200,
// //               crop: 'fill',
// //           }
// //       ]
// //     })
// //     console.log(url);
// // })();

// module.exports = cloudinary;
require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dvnr2fqlk',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('✅ Connected to Cloudinary successfully.');

// Multer storage configuration for Cloudinary
const createCloudinaryStorage = (folder) => new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: folder,
        allowed_formats: ['jpeg', 'png', 'jpg', 'gif'],
    },
});

const storageMovie = createCloudinaryStorage('movie_poster');
const storageAvatar = createCloudinaryStorage('avatar_folder'); // Assuming a different folder for avatars

const uploadPoster = multer({ storage: storageMovie });
const uploadAvatar = multer({ storage: storageAvatar });

module.exports = { cloudinary, uploadPoster, uploadAvatar };
