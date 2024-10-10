const Url = require('./../models/url_model')
const User = require('./../models/user_model')
const { v4: uuidv4 } = require('uuid') 
const asyncHandler = require('express-async-handler')
const validUrl = require('valid-url')

exports.shorten = asyncHandler(async (req, res) => {
    const { originalUrl } = req.body;
    const userId = req.user._id;

    // Validate the URL before processing
    if (!validUrl.isUri(originalUrl)) {
        return res.status(400).json({ status: 'fail', message: 'Invalid URL' });
    }

    // Check if the URL has already been shortened to avoid duplicates
    let existingUrl = await Url.findOne({ originalUrl, userId });
    if (existingUrl) {
        return res.status(200).json({
            status: 'success',
            data: existingUrl
        });
    }


    const urlCode = uuidv4().slice(0, 8); //secure ID generator
    const shortUrl = `${process.env.BASE_URL}/${urlCode}`;

    const urlShorted = await Url.create({ originalUrl, shortUrl, urlCode, userId });

    // Add the shortened URL to the user's URL list
    await User.findByIdAndUpdate(userId, {
        $push: { urls: urlShorted._id },
    });

    res.status(201).json({
        status: 'success',
        data: urlShorted
    });
});

// Function to redirect based on the shortened URL code
exports.redirect = asyncHandler(async (req, res) => {
    const urlCode = req.params.code;
    const urlData = await Url.findOne({ urlCode });

    if (urlData) {
        return res.redirect(urlData.originalUrl);
    } else {
        return res.status(404).json({
            status: 'fail',
            message: 'URL not found'
        });
    }
});
