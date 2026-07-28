const asyncHandler = require('../../utils/asyncHandler');
const fileUploadService = require('./fileUpload.service');

const uploadFileAndProcessOCR = asyncHandler(async (req, res) => {
  const result = await fileUploadService.uploadFileAndProcessOCR(req.file, req.user);
  return res.status(201).json({
    success: true,
    message: 'File uploaded and processed via OCR successfully',
    data: result
  });
});

const getAllUploadedFiles = asyncHandler(async (req, res) => {
  const result = await fileUploadService.getAllUploadedFiles(req.query);
  return res.status(200).json({
    success: true,
    data: result.files,
    pagination: result.pagination
  });
});

const getFileById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const file = await fileUploadService.getFileById(id);
  return res.status(200).json({
    success: true,
    data: file
  });
});

module.exports = {
  uploadFileAndProcessOCR,
  getAllUploadedFiles,
  getFileById
};
