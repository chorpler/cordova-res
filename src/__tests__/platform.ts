import { Platform } from '../platform';
import { RESOURCES, ResourceType } from '../resources';

describe('cordova-res', () => {

  describe('platform', () => {

    describe('run', () => {

      let platform: typeof import('../platform');
      let fsMock: { [key: string]: jest.Mock };
      let imageMock: { [key: string]: jest.Mock };

      beforeEach(async () => {
        jest.resetModules();

        fsMock = {
          ensureDir: jest.fn(),
        };

        imageMock = {
          resolveSourceImage: jest.fn(),
          generateImage: jest.fn(),
        };

        jest.mock('@ionic/utils-fs', () => fsMock);
        jest.mock('../image', () => imageMock);

        platform = await import('../platform');
      });

      it('should run through android icons with successful result', async () => {
        const pipeline: any = { clone: jest.fn(() => pipeline) };
        imageMock.resolveSourceImage.mockImplementation(async () => ['test.png', pipeline]);

        const result = await platform.run(Platform.ANDROID, 'resources', {
          [ResourceType.ICON]: { sources: ['icon.png'] },
          pngOptions: { quality: 80 },
        });

        const generatedImages = RESOURCES[Platform.ANDROID][ResourceType.ICON].images;

        expect(imageMock.resolveSourceImage).toHaveBeenCalledTimes(1);
        expect(imageMock.resolveSourceImage).toHaveBeenCalledWith('icon', ['icon.png'], undefined);
        expect(fsMock.ensureDir).toHaveBeenCalledTimes(1);
        expect(imageMock.generateImage).toHaveBeenCalledTimes(generatedImages.length);

        for (const generatedImage of generatedImages) {
          expect(imageMock.generateImage).toHaveBeenCalledWith(generatedImage, expect.anything(), expect.any(String), expect.anything());
        }

        expect(result.length).toEqual(generatedImages.length);

        for (const image of result) {
          expect(image).toEqual(expect.objectContaining({ src: 'test.png' }));
        }
      });

    });

    describe('isSupportedPlatform', () => {

      let isSupportedPlatform: typeof import('../platform').isSupportedPlatform;

      beforeEach(async () => {
        ({ isSupportedPlatform } = await import('../platform'));
      });

      it('should support android', async () => {
        expect(isSupportedPlatform('android')).toEqual(true);
      });

      it('should support ios', async () => {
        expect(isSupportedPlatform('ios')).toEqual(true);
      });

      it('should not support garbage', async () => {
        expect(isSupportedPlatform('garbage')).toEqual(false);
      });

    });

  });

});
