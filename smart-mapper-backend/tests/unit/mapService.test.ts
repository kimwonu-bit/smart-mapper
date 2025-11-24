import { MapService } from '../../src/services/mapService';

jest.mock('../../src/models/Map', () => ({
  MapModel: {
    findById: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn()
  }
}));

describe('MapService', () => {
  let mapService: MapService;

  beforeEach(() => {
    mapService = MapService.getInstance();
    mapService.reset();
  });

  describe('session management', () => {
    it('should start a new mapping session', async () => {
      await mapService.startNewSession('test-client');

      const sessionId = mapService.getCurrentSessionId();

      expect(sessionId).toBeDefined();
      expect(sessionId).toContain('test-client');
    });

    it('should return null when no session is active', () => {
      const mapData = mapService.getCurrentMapData();

      expect(mapData).toBeNull();
    });
  });

  describe('map updates', () => {
    beforeEach(async () => {
      await mapService.startNewSession('test-client');
    });

    it('should update map with sensor data', () => {
      const sensorData = {
        distance: 100,
        angle: 90,
        position: { x: 0, y: 0 },
        cartesian: { x: 0, y: 100 }
      };

      mapService.updateMap(sensorData);

      const mapData = mapService.getCurrentMapData();

      expect(mapData).toBeDefined();
      expect(mapData!.grid).toBeDefined();
    });

    it('should mark obstacles on the grid', () => {
      const sensorData = {
        distance: 50,
        angle: 90,
        position: { x: 0, y: 0 },
        cartesian: { x: 0, y: 50 }
      };

      for (let i = 0; i < 5; i++) {
        mapService.updateMap(sensorData);
      }

      const mapData = mapService.getCurrentMapData();
      const hasObstacle = mapData!.grid.some(row =>
        row.some(cell => cell === 1)
      );

      expect(hasObstacle).toBe(true);
    });

    it('should mark visited cells', () => {
      const sensorData = {
        distance: 100,
        angle: 90,
        position: { x: 0, y: 0 },
        cartesian: { x: 0, y: 100 }
      };

      mapService.updateMap(sensorData);

      const mapData = mapService.getCurrentMapData();
      const hasVisited = mapData!.grid.some(row =>
        row.some(cell => cell === 0)
      );

      expect(hasVisited).toBe(true);
    });
  });

  describe('getCurrentMapData', () => {
    it('should return map data with correct structure', async () => {
      await mapService.startNewSession('test-client');

      const mapData = mapService.getCurrentMapData();

      expect(mapData).toHaveProperty('grid');
      expect(mapData).toHaveProperty('width');
      expect(mapData).toHaveProperty('height');
      expect(mapData).toHaveProperty('resolution');
      expect(mapData).toHaveProperty('origin');
    });
  });

  describe('reset', () => {
    it('should clear all map data on reset', async () => {
      await mapService.startNewSession('test-client');
      mapService.updateMap({
        distance: 100,
        angle: 90,
        position: { x: 0, y: 0 },
        cartesian: { x: 0, y: 100 }
      });

      mapService.reset();

      expect(mapService.getCurrentSessionId()).toBeNull();
      expect(mapService.getCurrentMapData()).toBeNull();
    });
  });
});
