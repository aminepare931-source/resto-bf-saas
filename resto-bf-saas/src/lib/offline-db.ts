/**
 * Offline Database — IndexedDB wrapper for caching data locally
 * Permet de stocker et récupérer les données même sans connexion Internet.
 */

import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "restobf-offline";
const DB_VERSION = 1;

type StoreName = "menu_items" | "categories" | "restaurants" | "settings" | "pages" | "images" | "pending_sync";

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("menu_items")) {
          db.createObjectStore("menu_items", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("categories")) {
          db.createObjectStore("categories", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("restaurants")) {
          db.createObjectStore("restaurants", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("settings")) {
          db.createObjectStore("settings", { keyPath: "key" });
        }
        if (!db.objectStoreNames.contains("pages")) {
          db.createObjectStore("pages", { keyPath: "url" });
        }
        if (!db.objectStoreNames.contains("images")) {
          db.createObjectStore("images", { keyPath: "url" });
        }
        if (!db.objectStoreNames.contains("pending_sync")) {
          const store = db.createObjectStore("pending_sync", {
            keyPath: "id",
            autoIncrement: true,
          });
          store.createIndex("type", "type");
          store.createIndex("created_at", "created_at");
        }
      },
    });
  }
  return dbPromise;
}

// ─── Generic CRUD ───

export async function cacheData(store: StoreName, data: Record<string, unknown> | Record<string, unknown>[]) {
  const db = await getDb();
  const tx = db.transaction(store, "readwrite");
  const items = Array.isArray(data) ? data : [data];
  for (const item of items) {
    await tx.store.put(item);
  }
  await tx.done;
}

export async function getCachedData<T = unknown>(store: StoreName, key?: string): Promise<T | T[] | null> {
  const db = await getDb();
  if (key) {
    return (await db.get(store, key)) as T | null;
  }
  return (await db.getAll(store)) as T[];
}

export async function clearStore(store: StoreName) {
  const db = await getDb();
  await db.clear(store);
}

// ─── Pages cache ───

export async function cachePage(url: string, html: string) {
  await cacheData("pages", { url, html, cached_at: Date.now() });
}

export async function getCachedPage(url: string): Promise<string | null> {
  const entry = await getCachedData<{ html: string }>("pages", url);
  return entry?.html ?? null;
}

// ─── Images cache ───

export async function cacheImage(url: string, blob: Blob) {
  const db = await getDb();
  await db.put("images", { url, blob, cached_at: Date.now() });
}

export async function getCachedImage(url: string): Promise<Blob | null> {
  const entry = await getCachedData<{ blob: Blob }>("images", url);
  return entry?.blob ?? null;
}

// ─── Settings ───

export async function saveSetting(key: string, value: unknown) {
  await cacheData("settings", { key, value, updated_at: Date.now() });
}

export async function getSetting<T = unknown>(key: string): Promise<T | null> {
  const entry = await getCachedData<{ value: T }>("settings", key);
  return entry?.value ?? null;
}

// ─── Pending Sync Queue ───

export type PendingAction = {
  id?: number;
  type: string;
  endpoint: string;
  method: "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  created_at: number;
  retries?: number;
};

export async function addPendingAction(action: Omit<PendingAction, "id" | "created_at" | "retries">) {
  const db = await getDb();
  return db.add("pending_sync", {
    ...action,
    created_at: Date.now(),
    retries: 0,
  });
}

export async function getPendingActions(): Promise<PendingAction[]> {
  const db = await getDb();
  return db.getAll("pending_sync");
}

export async function removePendingAction(id: number) {
  const db = await getDb();
  await db.delete("pending_sync", id);
}

export async function incrementRetry(id: number) {
  const db = await getDb();
  const tx = db.transaction("pending_sync", "readwrite");
  const item = await tx.store.get(id);
  if (item) {
    item.retries = (item.retries ?? 0) + 1;
    await tx.store.put(item);
  }
  await tx.done;
}

// ─── Restaurant data helpers ───

export async function cacheRestaurantData(restaurantId: string, data: {
  menu_items?: Record<string, unknown>[];
  categories?: Record<string, unknown>[];
  restaurant?: Record<string, unknown>;
}) {
  if (data.menu_items) {
    await cacheData("menu_items", data.menu_items.map((item) => ({ ...item, _restaurantId: restaurantId })));
  }
  if (data.categories) {
    await cacheData("categories", data.categories.map((cat) => ({ ...cat, _restaurantId: restaurantId })));
  }
  if (data.restaurant) {
    await cacheData("restaurants", { ...data.restaurant, id: restaurantId });
  }
}

export async function getCachedMenuItems(restaurantId: string): Promise<Record<string, unknown>[]> {
  const all = await getCachedData<Record<string, unknown>>("menu_items") as Record<string, unknown>[];
  return (all ?? []).filter((item) => item._restaurantId === restaurantId);
}

export async function getCachedCategories(restaurantId: string): Promise<Record<string, unknown>[]> {
  const all = await getCachedData<Record<string, unknown>>("categories") as Record<string, unknown>[];
  return (all ?? []).filter((cat) => cat._restaurantId === restaurantId);
}

export async function getCachedRestaurant(restaurantId: string): Promise<Record<string, unknown> | null> {
  return getCachedData("restaurants", restaurantId) as Promise<Record<string, unknown> | null>;
}