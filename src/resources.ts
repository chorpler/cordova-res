import { Sharp } from 'sharp';

import { ValidationError, ValidationErrorCode } from './error';
import { Platform } from './platform';

export const DEFAULT_RESOURCES_DIRECTORY = 'resources';

export const enum ResourceType {
  ICON = 'icon',
  SPLASH = 'splash',
}

export type ResourceValidator = (source: string, pipeline: Sharp) => Promise<void>;

export const RESOURCE_VALIDATORS: { readonly [T in ResourceType]: ResourceValidator; } = {
  [ResourceType.ICON]: async (source, pipeline) => {
    const metadata = await pipeline.metadata();
    const { format, width, height } = metadata;

    const requiredFormat = 'png';
    const requiredWidth = 1024;
    const requiredHeight = 1024;

    if (format !== requiredFormat) {
      throw new ValidationError(`Icon source must be ${requiredFormat} format (image format is "${format}").`, {
        source,
        type: ResourceType.ICON,
        code: ValidationErrorCode.BAD_IMAGE_FORMAT,
        format,
        requiredFormat,
      });
    }

    if (!width || !height || width < requiredWidth || height < requiredHeight) {
      throw new ValidationError(`Icon source does not meet minimum size requirements: ${requiredWidth}x${requiredHeight} (image is ${width}x${height}).`, {
        source,
        type: ResourceType.ICON,
        code: ValidationErrorCode.BAD_IMAGE_SIZE,
        width,
        height,
        requiredWidth,
        requiredHeight,
      });
    }
  },
  [ResourceType.SPLASH]: async (source, pipeline) => {
    const metadata = await pipeline.metadata();
    const { format, width, height } = metadata;

    const requiredFormat = 'png';
    const requiredWidth = 2732;
    const requiredHeight = 2732;

    if (format !== requiredFormat) {
      throw new ValidationError(`Splash Screen source must be ${requiredFormat} format (image format is "${format}").`, {
        source,
        type: ResourceType.SPLASH,
        code: ValidationErrorCode.BAD_IMAGE_FORMAT,
        format,
        requiredFormat,
      });
    }

    if (!width || !height || width < requiredWidth || height < requiredHeight) {
      throw new ValidationError(`Splash Screen source does not meet minimum size requirements: ${requiredWidth}x${requiredHeight} (image is ${width}x${height}).`, {
        source,
        type: ResourceType.SPLASH,
        code: ValidationErrorCode.BAD_IMAGE_SIZE,
        width,
        height,
        requiredWidth,
        requiredHeight,
      });
    }
  },
};

export const RESOURCE_TYPES: ReadonlyArray<ResourceType> = [ResourceType.ICON, ResourceType.SPLASH];

export const enum Orientation {
  LANDSCAPE = 'landscape',
  PORTRAIT = 'portrait',
}

export const enum Density {
  LDPI = 'ldpi',
  MDPI = 'mdpi',
  HDPI = 'hdpi',
  XHDPI = 'xhdpi',
  XXHDPI = 'xxhdpi',
  XXXHDPI = 'xxxhdpi',
  LAND_LDPI = 'land-ldpi',
  LAND_MDPI = 'land-mdpi',
  LAND_HDPI = 'land-hdpi',
  LAND_XHDPI = 'land-xhdpi',
  LAND_XXHDPI = 'land-xxhdpi',
  LAND_XXXHDPI = 'land-xxxhdpi',
  PORT_LDPI = 'port-ldpi',
  PORT_MDPI = 'port-mdpi',
  PORT_HDPI = 'port-hdpi',
  PORT_XHDPI = 'port-xhdpi',
  PORT_XXHDPI = 'port-xxhdpi',
  PORT_XXXHDPI = 'port-xxxhdpi',
}

export const enum ResourceKey {
  SRC = 'src',
  NAME = 'name',
  WIDTH = 'width',
  HEIGHT = 'height',
  DENSITY = 'density',
  ORIENTATION = 'orientation',
}

export interface ResourcesImageConfig {
  readonly [ResourceKey.NAME]: string;
  readonly [ResourceKey.WIDTH]: number;
  readonly [ResourceKey.HEIGHT]: number;
  readonly [ResourceKey.DENSITY]?: Density;
  readonly [ResourceKey.ORIENTATION]?: Orientation;
}

export interface ResourcesTypeConfig {
  readonly images: ReadonlyArray<ResourcesImageConfig>;
  readonly nodeName: string;
  readonly nodeAttributes: ResourceKey[];
}

export type ResourcesPlatform = { readonly [T in ResourceType]: ResourcesTypeConfig; };
export type ResourcesConfig = { readonly [P in Platform]: ResourcesPlatform; };

export function validateResourceTypes(types: ReadonlyArray<string>): ResourceType[] {
  const result: ResourceType[] = [];

  for (const type of types) {
    if (!isSupportedResourceType(type)) {
      throw new Error(`Unsupported resource type: ${type}`);
    }

    result.push(type);
  }

  return result;
}

export function isSupportedResourceType(type: any): type is ResourceType {
  return RESOURCE_TYPES.includes(type);
}

export const RESOURCES: ResourcesConfig = Object.freeze({
  [Platform.ANDROID]: Object.freeze({
    [ResourceType.ICON]: Object.freeze({
      images: [
        Object.freeze({ name: 'drawable-ldpi-icon.png', width: 36, height: 36, density: Density.LDPI }),
        Object.freeze({ name: 'drawable-mdpi-icon.png', width: 48, height: 48, density: Density.MDPI }),
        Object.freeze({ name: 'drawable-hdpi-icon.png', width: 72, height: 72, density: Density.HDPI }),
        Object.freeze({ name: 'drawable-xhdpi-icon.png', width: 96, height: 96, density: Density.XHDPI }),
        Object.freeze({ name: 'drawable-xxhdpi-icon.png', width: 144, height: 144, density: Density.XXHDPI }),
        Object.freeze({ name: 'drawable-xxxhdpi-icon.png', width: 192, height: 192, density: Density.XXXHDPI }),
      ],
      nodeName: 'icon',
      nodeAttributes: [ResourceKey.SRC, ResourceKey.DENSITY],
    }),
    [ResourceType.SPLASH]: Object.freeze({
      images: [
        Object.freeze({ name: 'drawable-land-ldpi-screen.png', width: 320, height: 240, density: Density.LAND_LDPI, orientation: Orientation.LANDSCAPE }),
        Object.freeze({ name: 'drawable-land-mdpi-screen.png', width: 480, height: 320, density: Density.LAND_MDPI, orientation: Orientation.LANDSCAPE }),
        Object.freeze({ name: 'drawable-land-hdpi-screen.png', width: 800, height: 480, density: Density.LAND_HDPI, orientation: Orientation.LANDSCAPE }),
        Object.freeze({ name: 'drawable-land-xhdpi-screen.png', width: 1280, height: 720, density: Density.LAND_XHDPI, orientation: Orientation.LANDSCAPE }),
        Object.freeze({ name: 'drawable-land-xxhdpi-screen.png', width: 1600, height: 960, density: Density.LAND_XXHDPI, orientation: Orientation.LANDSCAPE }),
        Object.freeze({ name: 'drawable-land-xxxhdpi-screen.png', width: 1920, height: 1280, density: Density.LAND_XXXHDPI, orientation: Orientation.LANDSCAPE }),
        Object.freeze({ name: 'drawable-port-ldpi-screen.png', width: 240, height: 320, density: Density.PORT_LDPI, orientation: Orientation.PORTRAIT }),
        Object.freeze({ name: 'drawable-port-mdpi-screen.png', width: 320, height: 480, density: Density.PORT_MDPI, orientation: Orientation.PORTRAIT }),
        Object.freeze({ name: 'drawable-port-hdpi-screen.png', width: 480, height: 800, density: Density.PORT_HDPI, orientation: Orientation.PORTRAIT }),
        Object.freeze({ name: 'drawable-port-xhdpi-screen.png', width: 720, height: 1280, density: Density.PORT_XHDPI, orientation: Orientation.PORTRAIT }),
        Object.freeze({ name: 'drawable-port-xxhdpi-screen.png', width: 960, height: 1600, density: Density.PORT_XXHDPI, orientation: Orientation.PORTRAIT }),
        Object.freeze({ name: 'drawable-port-xxxhdpi-screen.png', width: 1280, height: 1920, density: Density.PORT_XXXHDPI, orientation: Orientation.PORTRAIT }),
      ],
      nodeName: 'splash',
      nodeAttributes: [ResourceKey.SRC, ResourceKey.DENSITY],
    }),
  }),
  [Platform.IOS]: Object.freeze({
    [ResourceType.ICON]: Object.freeze({
      images: [
        Object.freeze({ name: 'icon.png', width: 57, height: 57 }),
        Object.freeze({ name: 'icon@2x.png', width: 114, height: 114 }),
        Object.freeze({ name: 'icon-40.png', width: 40, height: 40 }),
        Object.freeze({ name: 'icon-40@2x.png', width: 80, height: 80 }),
        Object.freeze({ name: 'icon-40@3x.png', width: 120, height: 120 }),
        Object.freeze({ name: 'icon-50.png', width: 50, height: 50 }),
        Object.freeze({ name: 'icon-50@2x.png', width: 100, height: 100 }),
        Object.freeze({ name: 'icon-60.png', width: 60, height: 60 }),
        Object.freeze({ name: 'icon-60@2x.png', width: 120, height: 120 }),
        Object.freeze({ name: 'icon-60@3x.png', width: 180, height: 180 }),
        Object.freeze({ name: 'icon-72.png', width: 72, height: 72 }),
        Object.freeze({ name: 'icon-72@2x.png', width: 144, height: 144 }),
        Object.freeze({ name: 'icon-76.png', width: 76, height: 76 }),
        Object.freeze({ name: 'icon-76@2x.png', width: 152, height: 152 }),
        Object.freeze({ name: 'icon-83.5@2x.png', width: 167, height: 167 }),
        Object.freeze({ name: 'icon-small.png', width: 29, height: 29 }),
        Object.freeze({ name: 'icon-small@2x.png', width: 58, height: 58 }),
        Object.freeze({ name: 'icon-small@3x.png', width: 87, height: 87 }),
        Object.freeze({ name: 'icon-1024.png', width: 1024, height: 1024 }),
      ],
      nodeName: 'icon',
      nodeAttributes: [ResourceKey.SRC, ResourceKey.WIDTH, ResourceKey.HEIGHT],
    }),
    [ResourceType.SPLASH]: Object.freeze({
      images: [
        Object.freeze({ name: 'Default-568h@2x~iphone.png', width: 640, height: 1136, orientation: Orientation.PORTRAIT }),
        Object.freeze({ name: 'Default-667h.png', width: 750, height: 1334, orientation: Orientation.PORTRAIT }),
        Object.freeze({ name: 'Default-736h.png', width: 1242, height: 2208, orientation: Orientation.PORTRAIT }),
        Object.freeze({ name: 'Default-2436h.png', width: 1125, height: 2436, orientation: Orientation.PORTRAIT }),
        Object.freeze({ name: 'Default-Landscape-736h.png', width: 2208, height: 1242, orientation: Orientation.LANDSCAPE }),
        Object.freeze({ name: 'Default-Landscape-2436h.png', width: 2436, height: 1125, orientation: Orientation.LANDSCAPE }),
        Object.freeze({ name: 'Default-Landscape@2x~ipad.png', width: 2048, height: 1536, orientation: Orientation.LANDSCAPE }),
        Object.freeze({ name: 'Default-Landscape@~ipadpro.png', width: 2732, height: 2048, orientation: Orientation.LANDSCAPE }),
        Object.freeze({ name: 'Default-Landscape~ipad.png', width: 1024, height: 768, orientation: Orientation.LANDSCAPE }),
        Object.freeze({ name: 'Default-Portrait@2x~ipad.png', width: 1536, height: 2048, orientation: Orientation.PORTRAIT }),
        Object.freeze({ name: 'Default-Portrait@~ipadpro.png', width: 2048, height: 2732, orientation: Orientation.PORTRAIT }),
        Object.freeze({ name: 'Default-Portrait~ipad.png', width: 768, height: 1024, orientation: Orientation.PORTRAIT }),
        Object.freeze({ name: 'Default@2x~iphone.png', width: 640, height: 960, orientation: Orientation.PORTRAIT }),
        Object.freeze({ name: 'Default~iphone.png', width: 320, height: 480, orientation: Orientation.PORTRAIT }),
        // Object.freeze({ name: 'Default@2x~universal~anyany.png', width: 2732, height: 2732 }),
        Object.freeze({ name: 'Default@2x~ipad~anyany.png', width: 2732, height: 2732 }),
        Object.freeze({ name: 'Default@2x~ipad~comany.png', width: 1278, height: 2732, orientation: Orientation.PORTRAIT }),
        Object.freeze({ name: 'Default@2x~iphone~anyany.png', width: 1334, height: 1334 }),
        Object.freeze({ name: 'Default@2x~iphone~comany.png', width: 750, height: 1334, orientation: Orientation.PORTRAIT }),
        Object.freeze({ name: 'Default@2x~iphone~comcom.png', width: 1334, height: 750, orientation: Orientation.LANDSCAPE }),
        Object.freeze({ name: 'Default@3x~iphone~anyany.png', width: 2436, height: 2436 }),
        Object.freeze({ name: 'Default@3x~iphone~anycom.png', width: 2436, height: 1242, orientation: Orientation.LANDSCAPE }),
        Object.freeze({ name: 'Default@3x~iphone~comany.png', width: 1242, height: 2436, orientation: Orientation.PORTRAIT }),
      ],
      nodeName: 'splash',
      nodeAttributes: [ResourceKey.SRC, ResourceKey.WIDTH, ResourceKey.HEIGHT],
    }),
  }),
});
