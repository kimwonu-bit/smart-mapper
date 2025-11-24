import { logger } from '../utils/logger';
import { MapModel, IMap } from '../models/Map';
import sharp from 'sharp';

interface GridCell {
  occupied: number;
  visited: number;
  lastUpdate: number;
}

interface MapData {
  grid: number[][];
  width: number;
  height: number;
  resolution: number;
  origin: { x: number; y: number };
}

interface ProcessedSensorData {
  distance: number;
  angle: number;
  position: { x: number; y: number };
  cartesian: { x: number; y: number };
}

export class MapService {
  private static instance: MapService;
  private grid: GridCell[][];
  private gridSize: number;
  private cellSize: number;
  private maxDistance: number;
  private sessionId: string | null = null;
  private sessionStartTime: number = 0;
  private updateCount: number = 0;

  private constructor() {
    this.gridSize = parseInt(process.env.MAP_GRID_SIZE || '100');
    this.cellSize = parseInt(process.env.MAP_CELL_SIZE || '10');
    this.maxDistance = parseInt(process.env.MAP_MAX_DISTANCE || '400');
    this.grid = this.initializeGrid();
  }

  public static getInstance(): MapService {
    if (!MapService.instance) {
      MapService.instance = new MapService();
    }
    return MapService.instance;
  }

  private initializeGrid(): GridCell[][] {
    const grid: GridCell[][] = [];
    for (let i = 0; i < this.gridSize; i++) {
      grid[i] = [];
      for (let j = 0; j < this.gridSize; j++) {
        grid[i][j] = { occupied: 0, visited: 0, lastUpdate: 0 };
      }
    }
    return grid;
  }

  public async startNewSession(clientId: string): Promise<void> {
    this.grid = this.initializeGrid();
    this.sessionId = `session_${Date.now()}_${clientId}`;
    this.sessionStartTime = Date.now();
    this.updateCount = 0;
    logger.info(`New mapping session started: ${this.sessionId}`);
  }

  public getCurrentSessionId(): string | null {
    return this.sessionId;
  }

  public updateMap(sensorData: ProcessedSensorData): void {
    if (!this.sessionId) return;

    const { position, cartesian, distance } = sensorData;

    const robotCell = this.worldToGrid(position.x, position.y);
    if (this.isValidCell(robotCell.x, robotCell.y)) {
      this.grid[robotCell.x][robotCell.y].visited++;
    }

    if (distance < this.maxDistance) {
      const obstacleCell = this.worldToGrid(cartesian.x, cartesian.y);
      if (this.isValidCell(obstacleCell.x, obstacleCell.y)) {
        this.grid[obstacleCell.x][obstacleCell.y].occupied++;
        this.grid[obstacleCell.x][obstacleCell.y].lastUpdate = Date.now();
      }

      this.updateRayTrace(robotCell, obstacleCell);
    }

    this.updateCount++;
  }

  private updateRayTrace(
    start: { x: number; y: number },
    end: { x: number; y: number }
  ): void {
    const dx = Math.abs(end.x - start.x);
    const dy = Math.abs(end.y - start.y);
    const sx = start.x < end.x ? 1 : -1;
    const sy = start.y < end.y ? 1 : -1;
    let err = dx - dy;

    let x = start.x;
    let y = start.y;

    while (x !== end.x || y !== end.y) {
      if (this.isValidCell(x, y) && (x !== end.x || y !== end.y)) {
        this.grid[x][y].visited++;
      }

      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }
  }

  private worldToGrid(x: number, y: number): { x: number; y: number } {
    const centerOffset = Math.floor(this.gridSize / 2);
    return {
      x: Math.floor(x / this.cellSize) + centerOffset,
      y: Math.floor(y / this.cellSize) + centerOffset
    };
  }

  private gridToWorld(gx: number, gy: number): { x: number; y: number } {
    const centerOffset = Math.floor(this.gridSize / 2);
    return {
      x: (gx - centerOffset) * this.cellSize,
      y: (gy - centerOffset) * this.cellSize
    };
  }

  private isValidCell(x: number, y: number): boolean {
    return x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize;
  }

  public getCurrentMapData(): MapData | null {
    if (!this.sessionId) return null;

    const gridData: number[][] = [];
    for (let i = 0; i < this.gridSize; i++) {
      gridData[i] = [];
      for (let j = 0; j < this.gridSize; j++) {
        const cell = this.grid[i][j];
        if (cell.occupied > 3) {
          gridData[i][j] = 1;
        } else if (cell.visited > 0) {
          gridData[i][j] = 0;
        } else {
          gridData[i][j] = -1;
        }
      }
    }

    return {
      grid: gridData,
      width: this.gridSize,
      height: this.gridSize,
      resolution: this.cellSize,
      origin: this.gridToWorld(0, 0)
    };
  }

  public async endSession(): Promise<IMap | null> {
    if (!this.sessionId) return null;

    const mapData = this.getCurrentMapData();
    if (!mapData) return null;

    const map = new MapModel({
      sessionId: this.sessionId,
      name: `Map_${new Date().toISOString()}`,
      gridData: mapData.grid,
      width: mapData.width,
      height: mapData.height,
      resolution: mapData.resolution,
      origin: mapData.origin,
      metadata: {
        duration: Date.now() - this.sessionStartTime,
        updateCount: this.updateCount,
        coverage: this.calculateCoverage()
      }
    });

    await map.save();
    logger.info(`Map saved: ${map._id}`);

    this.sessionId = null;
    return map;
  }

  private calculateCoverage(): number {
    let visited = 0;
    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        if (this.grid[i][j].visited > 0 || this.grid[i][j].occupied > 0) {
          visited++;
        }
      }
    }
    return (visited / (this.gridSize * this.gridSize)) * 100;
  }

  public async exportAsImage(mapId: string): Promise<Buffer> {
    const map = await MapModel.findById(mapId);
    if (!map) {
      throw new Error('Map not found');
    }

    const width = map.width;
    const height = map.height;
    const pixels = Buffer.alloc(width * height * 3);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 3;
        const value = map.gridData[x][y];

        if (value === 1) {
          pixels[idx] = 0;
          pixels[idx + 1] = 0;
          pixels[idx + 2] = 0;
        } else if (value === 0) {
          pixels[idx] = 255;
          pixels[idx + 1] = 255;
          pixels[idx + 2] = 255;
        } else {
          pixels[idx] = 128;
          pixels[idx + 1] = 128;
          pixels[idx + 2] = 128;
        }
      }
    }

    return sharp(pixels, {
      raw: { width, height, channels: 3 }
    })
      .png()
      .toBuffer();
  }

  public reset(): void {
    this.grid = this.initializeGrid();
    this.sessionId = null;
    this.updateCount = 0;
    logger.info('Map service reset');
  }
}
