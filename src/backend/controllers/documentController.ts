import { Request, Response, NextFunction } from 'express';
import { repository } from '../repositories';
import { NotFoundError } from '../utils/errors';
import { DocumentExtractionService } from '../services/extraction/documentExtractionService';
import { getSupabaseClient } from '../db/client';

export class DocumentController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id || 'user-ahamed-001';
      const docs = await repository.listByUser(userId);
      res.json({ success: true, data: docs });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const doc = await repository.findById(id, userId);
      if (!doc) {
        throw new NotFoundError(`Document with ID "${id}" was not found.`);
      }
      res.json({ success: true, data: doc });
    } catch (err) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id || 'user-ahamed-001';
      const { name, type, size, fileContentBase64 } = req.body;
      
      const newDoc = await repository.create({
        name,
        type,
        size: size || '1.8 MB',
        userId,
        status: 'uploaded',
        summary: `Document "${name}" uploaded. Ready for deep legal analysis.`,
      });

      const supabase = getSupabaseClient();
      if (supabase && fileContentBase64) {
        try {
          const buffer = Buffer.from(fileContentBase64, 'base64');
          const ext = type === 'pdf' ? 'pdf' : 'docx';
          const filePath = `${userId}/${newDoc.id}.${ext}`;
          const { error } = await supabase.storage.from('documents').upload(filePath, buffer, {
            contentType: type === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            upsert: true
          });
          
          if (error) {
             console.error('Supabase storage upload error:', error);
          } else {
             // In a real app we'd update newDoc.storagePath here.
          }
        } catch (storageErr) {
          console.error('Failed to upload document to storage:', storageErr);
        }
      }

      // Launch async processing pipeline in background
      DocumentExtractionService.processDocumentAsync(newDoc.id, userId, fileContentBase64).catch(err => {
        console.error('Async document extraction error:', err);
      });

      res.status(201).json({
        success: true,
        data: newDoc,
        message: 'Document uploaded successfully. Analysis job initialized.'
      });
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const deleted = await repository.delete(id, userId);
      if (!deleted) {
        throw new NotFoundError(`Document with ID "${id}" was not found.`);
      }
      res.json({ success: true, message: 'Document deleted successfully.' });
    } catch (err) {
      next(err);
    }
  }

  static async listVersions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const versions = await repository.listVersions(id);
      res.json({ success: true, data: versions });
    } catch (err) {
      next(err);
    }
  }

  static async createVersion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
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
