import { Router, Request, Response } from 'express';
import { upload } from '../middleware/upload';

export const uploadRouter = Router();

uploadRouter.post('/', upload.array('files', 10), (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    res.status(400).json({ error: 'No files uploaded' });
    return;
  }

  const fileInfos = files.map((f) => ({
    originalName: f.originalname,
    savedPath: f.path,
    size: f.size,
    mimetype: f.mimetype,
  }));

  res.json({ files: fileInfos });
});
