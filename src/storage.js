import { openDB } from 'idb';

const DB_NAME = 'study-notes-ai';
const STORE_NAME = 'notes';

async function getDb() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      store.createIndex('updatedAt', 'updatedAt');
    }
  });
}

export async function getNotes() {
  const db = await getDb();
  const notes = await db.getAll(STORE_NAME);
  return notes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

export async function saveNote(note) {
  const db = await getDb();
  await db.put(STORE_NAME, note);
  return note;
}

export async function deleteNote(id) {
  const db = await getDb();
  await db.delete(STORE_NAME, id);
}
