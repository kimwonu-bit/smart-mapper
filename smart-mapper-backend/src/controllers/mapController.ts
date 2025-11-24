import { Request, Response, NextFunction } from 'express';
import { MapModel } from '../models/Map';
import { MapService } from '../services/mapService';
import { logger } from '../utils/logger';

export class MapController {
  private mapService: MapService;

  constructor() {
    this.mapService = MapService.getInstance();
  }

  public async getAllMaps(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const maps = await MapModel.find()
        .select('-gridData')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await MapModel.countDocuments();

      res.json({
        success: true,
        data: maps,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  public async getMapById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const map = await MapModel.findById(id);

      if (!map) {
        res.status(404).json({
          success: false,
          error: 'Map not found'
        });
        return;
      }

      res.json({
        success: true,
        data: map
      });
    } catch (error) {
      next(error);
    }
  }

  public async exportMap(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const format = (req.query.format as string) || 'png';

      const imageBuffer = await this.mapService.exportAsImage(id);

      res.set({
        'Content-Type': `image/${format}`,
        'Content-Disposition': `attachment; filename=map-${id}.${format}`
      });
      res.send(imageBuffer);
    } catch (error) {
      if ((error as Error).message === 'Map not found') {
        res.status(404).json({
          success: false,
          error: 'Map not found'
        });
        return;
      }
      next(error);
    }
  }

  public async deleteMap(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await MapModel.findByIdAndDelete(id);

      if (!result) {
        res.status(404).json({
          success: false,
          error: 'Map not found'
        });
        return;
      }

      logger.info(`Map deleted: ${id}`);
      res.json({
        success: true,
        message: 'Map deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  public async getCurrentMap(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const mapData = this.mapService.getCurrentMapData();

      if (!mapData) {
        res.status(404).json({
          success: false,
          error: 'No active mapping session'
        });
        return;
      }

      res.json({
        success: true,
        data: mapData
      });
    } catch (error) {
      next(error);
    }
  }
}
