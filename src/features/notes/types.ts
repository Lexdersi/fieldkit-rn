export interface Coords {
  latitude: number;
  longitude: number;
  accuracy: number | null; // metres
}

export interface FieldPhoto {
  uri: string; // file:// under Paths.document/field-photos
  coords: Coords | null;
  // Why there are no coords, in words the user can act on. Null when coords exist.
  locationNote: string | null;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: number; // ms since epoch
  // Local notes only
  pending?: boolean;
  syncFailed?: boolean; // the server rejected it; the note is kept on the device
  photo?: FieldPhoto | null;
}

// What the compose screen hands to the createNote mutation. clientId doubles as
// the idempotency key, so a retried POST can be de-duplicated server side.
export interface NewNote {
  clientId: string;
  title: string;
  content: string;
  createdAt: number;
  photo: FieldPhoto | null;
}
