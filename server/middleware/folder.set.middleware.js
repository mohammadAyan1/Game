export const setUploadFolder = (folderName) => {
    return (req, res, next) => {
        req.uploadFolder = folderName;
        next();
    };
};