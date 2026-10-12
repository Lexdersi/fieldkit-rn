import { Directory, File, Paths } from 'expo-file-system';

// The camera writes to a temporary cache file the OS may delete at any time.
// Copy it under Documents so the note's photo survives.
export async function savePhoto(tempUri: string, clientId: string): Promise<string> {
  const dir = new Directory(Paths.document, 'field-photos');
  dir.create({ idempotent: true, intermediates: true });

  const target = new File(dir, `${clientId}.jpg`);
  await new File(tempUri).copy(target);
  return target.uri;
}
