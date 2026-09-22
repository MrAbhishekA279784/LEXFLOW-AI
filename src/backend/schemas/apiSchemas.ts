import { z } from 'zod';

export const CreateDocumentBodySchema = z.object({
  name: z.string().min(1, 'Document name is required').max(255),
  type: z.enum(['pdf', 'docx']),
  size: z.string().optional().default('1.5 MB'),
  fileContentBase64: z.string().optional(),
});

export const AnalyzeDocumentParamsSchema = z.object({
  id: z.string().min(1),
});

export const RunScenarioBodySchema = z.object({
  prompt: z.string().optional(),
  rawPrompt: z.string().optional(),
  actorRole: z.string().optional().default('tenant'),
  forceRecalculate: z.boolean().optional().default(false),
}).refine(data => !!data.prompt || !!data.rawPrompt, {
  message: 'Either prompt or rawPrompt must be provided',
  path: ['prompt'],
}).transform(data => ({
  ...data,
  prompt: data.prompt || data.rawPrompt || '',
}));

export const AssistantMessageBodySchema = z.object({
  text: z.string().min(1, 'Message text is required').max(2000),
  history: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      text: z.string(),
    })
  ).optional(),
});

export const CompareDocumentsBodySchema = z.object({
  documentAId: z.string().min(1),
  documentBId: z.string().min(1),
});

export const RetrieveLawBodySchema = z.object({
  topic: z.string().min(2),
  jurisdiction: z.string().optional().default('India'),
  contractClauseContext: z.string().optional(),
});

export const LawyerKitParamsSchema = z.object({
  id: z.string().min(1),
});
