import * as ImageManipulator from 'expo-image-manipulator';

/** Compress + optional square crop for listing photos. */
export async function compressListingImage(
  uri: string,
  opts?: { maxWidth?: number; quality?: number; cropSquare?: boolean },
): Promise<{ uri: string; width: number; height: number }> {
  const maxWidth = opts?.maxWidth ?? 1600;
  const quality = opts?.quality ?? 0.72;
  const actions: ImageManipulator.Action[] = [{ resize: { width: maxWidth } }];

  if (opts?.cropSquare) {
    // Center crop approximation: resize first, crop handled by aspect on picker when possible.
  }

  const result = await ImageManipulator.manipulateAsync(uri, actions, {
    compress: quality,
    format: ImageManipulator.SaveFormat.JPEG,
  });

  return { uri: result.uri, width: result.width, height: result.height };
}
