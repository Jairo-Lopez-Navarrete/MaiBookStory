import { openDB } from 'idb'

const DB_NAME = 'MaiBookStoryOffline'
const STORE_NAME = 'books'
const QUEUE_STORE = 'syncQueue'

const dbPromise = openDB(DB_NAME, 2, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, {
        keyPath: 'id',
      })
    }

    if (!db.objectStoreNames.contains(QUEUE_STORE)) {
      db.createObjectStore(QUEUE_STORE, {
        keyPath: 'queueId',
        autoIncrement: true,
      })
    }
  },
})

export async function saveOfflineBooks(
  userId,
  books,
) {
  const db = await dbPromise

  const tx = db.transaction(
    STORE_NAME,
    'readwrite',
  )

  const store = tx.objectStore(STORE_NAME)

  const oldBooks = await store.getAll()

  for (const book of oldBooks) {
    if (
      book.user_id === userId ||
      book.offline_user_id === userId
    ) {
      await store.delete(book.id)
    }
  }

  for (const book of books) {
    await store.put({
      ...book,
      offline_user_id: userId,
    })
  }

  await tx.done
}

export async function getOfflineBooks(userId) {
  const db = await dbPromise

  const books = await db.getAll(STORE_NAME)

  return books.filter(
    (book) =>
      book.user_id === userId ||
      book.offline_user_id === userId,
  )
}

export async function saveOfflineBook(
  userId,
  book,
) {
  const db = await dbPromise

  await db.put(STORE_NAME, {
    ...book,
    offline_user_id: userId,
  })
}

export async function deleteOfflineBook(
  bookId,
) {
  const db = await dbPromise

  await db.delete(STORE_NAME, bookId)
}

export async function addToSyncQueue(operation) {
  const db = await dbPromise

  await db.add(QUEUE_STORE, {
    ...operation,
    created_at: Date.now(),
  })
}

export async function getSyncQueue() {
  const db = await dbPromise

  return db.getAll(QUEUE_STORE)
}

export async function removeFromSyncQueue(
  queueId,
) {
  const db = await dbPromise

  await db.delete(QUEUE_STORE, queueId)
}