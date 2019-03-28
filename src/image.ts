import { readFile, writeFile } from '@ionic/utils-fs';
import Debug from 'debug';
import sharp, { PngOptions, Sharp } from 'sharp';
import util from 'util';

import { ResolveSourceImageError, ValidationError } from './error';
import { RESOURCE_VALIDATORS, ResourceType } from './resources';

const debug = Debug('cordova-res:image');

/**
 * Check an array of source files, returning the first viable image.
 *
 * @return Promise<[path to source image, buffer of source image]>
 */
export async function resolveSourceImage(type: ResourceType, sources: string[], errstream?: NodeJS.WritableStream): Promise<[string, Sharp]> {
  const errors: [string, Error][] = [];

  for (const source of sources) {
    try {
      const image = sharp(await readFile(source));
      await RESOURCE_VALIDATORS[type](source, image);

      return [source, image];
    } catch (e) {
      errors.push([source, e]);
    }
  }

  if (errstream) {
    for (const [ source, error ] of errors) {
      const message = util.format('WARN: Error with source file %s: %s', source, error);
      errstream.write(`${message}\n`);
    }
  }

  throw new ResolveSourceImageError(
    `Could not find suitable source image. Looked at: ${sources.join(', ')}`,
    errors.map(([, error]) => error).filter((e): e is ValidationError => e instanceof ValidationError)
  );
}

export interface ImageSchema {
  width: number;
  height: number;
}

export async function generateImage(image: ImageSchema, src: Sharp, dest: string, options?: PngOptions): Promise<void> {
  debug('Generating %o (%ox%o)', dest, image.width, image.height);
  if (options) {
    debug('Generating using options %o', options);
  }

  const pipeline = transformImage(image, src, options);
  const pipelineBuffer = options ? await pipeline.png(options).toBuffer() : await pipeline.toBuffer();
  // await writeFile(dest, await pipeline.toBuffer());
  await writeFile(dest, pipelineBuffer);
}

export function transformImage(image: ImageSchema, src: Sharp, options?: PngOptions): Sharp {
  // if (options) {
    // return src.resize(image.width, image.height).png(options);
    // return src.resize(image.width, image.height);
  // } else {
    // return src.resize(image.width, image.height).flatten({background: 'white' });
    return src.resize(image.width, image.height);
  // }
}
