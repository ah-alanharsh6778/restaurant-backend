const prisma = require('../../config/prisma');

class FileUploadRepository {
  async saveUploadedFileWithOCR(fileData, ocrData) {
    return prisma.$transaction(async (tx) => {
      const uploadedFile = await tx.uploadedFile.create({
        data: fileData,
        include: { uploadedBy: { select: { id: true, fullName: true, email: true } } }
      });

      const ocrResult = await tx.oCRResult.create({
        data: {
          uploadedFileId: uploadedFile.id,
          rawText: ocrData.rawText || '',
          extractedJSON: ocrData.extractedJSON || {},
          confidenceScore: ocrData.confidenceScore || 0.95,
          status: 'PROCESSED'
        }
      });

      return { uploadedFile, ocrResult };
    });
  }

  async findById(id) {
    return prisma.uploadedFile.findUnique({
      where: { id },
      include: { uploadedBy: true, ocrResult: true }
    });
  }

  async findAll(options = {}) {
    const { skip, take, uploadedById } = options;
    const where = {};
    if (uploadedById) where.uploadedById = uploadedById;

    const [items, total] = await Promise.all([
      prisma.uploadedFile.findMany({
        where,
        skip: skip !== undefined ? parseInt(skip, 10) : undefined,
        take: take !== undefined ? parseInt(take, 10) : undefined,
        include: { uploadedBy: { select: { id: true, fullName: true } }, ocrResult: true },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.uploadedFile.count({ where })
    ]);

    return { items, total };
  }
}

module.exports = new FileUploadRepository();
