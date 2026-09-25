import { Request, Response, NextFunction } from 'express';
import { repository } from '../repositories';
import { NotFoundError, ValidationError, FileProcessingError } from '../utils/errors';
import { DocumentExtractionService } from '../services/extraction/documentExtractionService';
import { TextExtractor } from '../utils/textExtractor';
import { getSupabaseClient } from '../db/client';
import { logger } from '../utils/logger';

export class DocumentController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const rawPage = Number(req.query.page);
      const rawLimit = Number(req.query.limit);

      const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
      const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(Math.floor(rawLimit), 100) : 50;

      const docs = await repository.listByUser(userId, { page, limit });
      res.json({
        success: true,
        data: docs,
        pagination: {
          page,
          limit,
          count: docs.length,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const doc = await repository.findById(id, userId);
      if (!doc) {
        logger.warn('Document not found or tenant access denied', { id, userId, path: req.path });
        throw new NotFoundError(`Document with ID "${id}" was not found.`);
      }
      res.json({ success: true, data: doc });
    } catch (err) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Identity strictly from authenticated principal, ignoring any body-provided userId
      const userId = req.user!.id;

      let fileBuffer: Buffer | undefined;
      let filename: string;
      let fileType: 'pdf' | 'docx';
      let fileSize: number;
      let mimeType: string | undefined;

      // Handle multipart/form-data upload (via req.file)
      if (req.file) {
        fileBuffer = req.file.buffer;
        filename = req.file.originalname;
        fileSize = req.file.size;
        mimeType = req.file.mimetype;
        const ext = filename.split('.').pop()?.toLowerCase();
        fileType = ext === 'docx' ? 'docx' : 'pdf';
      } else if (req.body?.fileContentBase64) {
        // Handle JSON base64 upload
        filename = req.body.name || 'document.pdf';
        const ext = filename.split('.').pop()?.toLowerCase() || req.body.type || 'pdf';
        fileType = ext === 'docx' ? 'docx' : 'pdf';
        fileBuffer = Buffer.from(req.body.fileContentBase64, 'base64');
        fileSize = fileBuffer.length;
        mimeType = fileType === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      } else {
        throw new ValidationError('No document file payload received. Please attach a valid PDF or DOCX binary file.');
      }

      // Server-side file validation (size, MIME, magic bytes signature)
      TextExtractor.validateFile({
        name: filename,
        size: fileSize,
        mimetype: mimeType,
        buffer: fileBuffer
      });

      // Create initial document record in database repository
      const formattedSize = fileSize > 1024 * 1024 
        ? `${(fileSize / (1024 * 1024)).toFixed(1)} MB` 
        : `${Math.round(fileSize / 1024)} KB`;

      const newDoc = await repository.create({
        name: filename,
        type: fileType,
        size: formattedSize,
        userId,
        status: 'uploaded',
        summary: `Document "${filename}" uploaded successfully. Processing pipeline started.`,
      });

      // Secure storage upload (Supabase Storage)
      const supabase = getSupabaseClient();
      if (supabase && fileBuffer) {
        try {
          const sanitizedKey = `${userId}/${newDoc.id}/${filename.replace(/[^a-zA-Z0-9\._-]/g, '_')}`;
          const { error: storageErr } = await supabase.storage.from('documents').upload(sanitizedKey, fileBuffer, {
            contentType: mimeType || 'application/octet-stream',
            upsert: true
          });
          
          if (storageErr) {
            logger.warn('Supabase storage upload failed:', { error: String(storageErr.message || storageErr) });
          }
        } catch (storageErr) {
          logger.warn('Error uploading binary to Supabase storage:', { error: String(storageErr) });
        }
      }

      // Launch async processing pipeline in background
      DocumentExtractionService.processDocumentAsync(newDoc.id, userId, fileBuffer, filename, mimeType).catch(err => {
        logger.error('Async document processing failure:', { error: String(err) });
      });

      res.status(201).json({
        success: true,
        data: newDoc,
        message: 'Document uploaded successfully. Real ingestion & analysis pipeline initialized.'
      });
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const doc = await repository.findById(id, userId);
      if (!doc) {
        logger.warn('Document deletion denied or not found', { id, userId, path: req.path });
        throw new NotFoundError(`Document with ID "${id}" was not found.`);
      }
      await repository.delete(id, userId);
      res.json({ success: true, message: 'Document deleted successfully.' });
    } catch (err) {
      next(err);
    }
  }

  static async listVersions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const doc = await repository.findById(id, userId);
      if (!doc) {
        throw new NotFoundError(`Document with ID "${id}" was not found.`);
      }
      const versions = await repository.listVersions(id);
      res.json({ success: true, data: versions });
    } catch (err) {
      next(err);
    }
  }

  static async createVersion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const doc = await repository.findById(id, userId);
      if (!doc) {
        throw new NotFoundError(`Document with ID "${id}" was not found.`);
      }
      const versionData = req.body;
      const created = await repository.saveVersion(id, versionData);
      res.status(201).json({ success: true, data: created, message: 'New document version recorded.' });
    } catch (err) {
      next(err);
    }
  }

  static async revertVersion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, versionId } = req.params;
      const userId = req.user!.id;
      const doc = await repository.findById(id, userId);
      if (!doc) {
        throw new NotFoundError(`Document with ID "${id}" was not found.`);
      }
      const { note } = req.body || {};
      const result = await repository.revertVersion(id, versionId, note);
      res.json({
        success: true,
        data: result,
        message: `Successfully reverted document to version ${versionId}.`
      });
    } catch (err) {
      next(err);
    }
  }
}
