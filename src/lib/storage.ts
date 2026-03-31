import { cache } from "react";
import { revalidatePath } from "next/cache"; 
import { readData, writeData, settingsFile, productsFile, ordersFile, profilesFile } from "./db";
import path from "path";
import crypto from "crypto";
import { FALLBACK_PRODUCTS, FALLBACK_SETTINGS, FALLBACK_ORDERS } from "./fallback_constants";

const USE_FIREBASE = process.env.NEXT_PUBLIC_USE_FIREBASE === "true";

// Server-side only Firestore / Firebase adapter
const getAdapter = async () => {

  return await import("./firebase/server_firestore");
};

export const storage = {
  // Settings — per-request deduplication handles performance while ensuring absolutely fresh data globally
  getSettings: cache(async function() {
    let settings = null;
    if (USE_FIREBASE) {
      try {
        const { getSettingsFromFirestore } = await getAdapter();
        settings = await getSettingsFromFirestore();
      } catch (err) {
        console.warn("Firestore settings fetch failed. Using local fallback.", err);
      }
    }

    if (!settings || Object.keys(settings).length === 0) {
      settings = await readData(settingsFile, {});
    }

    if (!settings || Object.keys(settings).length === 0) {
      settings = FALLBACK_SETTINGS;
    }

    // Auto-inject demo banners if none exist in current DB config
    if (settings && (!settings.banners || settings.banners.length === 0)) {
      settings.banners = FALLBACK_SETTINGS.banners;
    }

    return settings;
  }),

  async updateSettings(data: any) {
    if (USE_FIREBASE) {
      try {
        const { updateSettingsInFirestore } = await getAdapter();
        await updateSettingsInFirestore(data); // await but don't return early
      } catch (err) {
        console.warn("Firestore settings update failed. Using local fallback.", err);
        await writeData(settingsFile, data);
      }
    } else {
      await writeData(settingsFile, data);
    }
    // Always revalidate regardless of Firebase or local mode
    revalidatePath("/", "layout");
    revalidatePath("/shop");
    return { success: true };
  },

  // ── Orders ────────────────────────────────────────────────────────────
  async getOrders(filters?: { userId?: string }) {
    if (USE_FIREBASE) {
      try {
        const adapter = await getAdapter();
        let orders;
        if (filters?.userId) {
          orders = await adapter.getOrdersByUser(filters.userId);
        } else {
          orders = await adapter.getAllOrders();
        }
        if (orders && orders.length > 0) return orders;
      } catch (err) {
        console.warn("Firestore orders fetch failed. Using local fallback.", err);
      }
    }
    const local = await readData(ordersFile, []);
    if (local && local.length > 0) return local;
    
    // In-memory or static fallback if fs read fails
    let res = FALLBACK_ORDERS as any[];
    if (filters?.userId) {
      res = res.filter((o: any) => o.userId === filters.userId);
    }
    return res;
  },

  async getOrderById(id: string) {
    if (USE_FIREBASE) {
      try {
        const { getOrderById } = await getAdapter();
        const order = await getOrderById(id);
        if (order && Object.keys(order).length > 0) return order;
      } catch (err) {
        console.warn("Firestore getOrderById failed. Using local fallback.", err);
      }
    }
    const orders = await readData(ordersFile, []);
    return orders.find((o: any) => o.id === id) || null;
  },

  async createOrder(data: any) {
    if (USE_FIREBASE) {
      try {
        const { createOrderInFirestore } = await getAdapter();
        return await createOrderInFirestore(data);
      } catch (err) {
        console.warn("Firestore createOrder failed. Using local fallback.", err);
      }
    }
    const orders = await readData(ordersFile, []);
    const newOrder = { id: crypto.randomUUID(), ...data, createdAt: new Date().toISOString() };
    orders.push(newOrder);
    await writeData(ordersFile, orders);
    return newOrder;
  },

  async updateOrder(id: string, fields: any) {
    if (USE_FIREBASE) {
      try {
        const { updateOrderInFirestore } = await getAdapter();
        return await updateOrderInFirestore(id, fields);
      } catch (err) {
        console.warn("Firestore updateOrder failed. Using local fallback.", err);
      }
    }
    const orders = await readData(ordersFile, []);
    const idx = orders.findIndex((o: any) => o.id === id);
    if (idx !== -1) {
      orders[idx] = { ...orders[idx], ...fields, updatedAt: new Date().toISOString() };
      await writeData(ordersFile, orders);
    }
  },

  async deleteOrder(id: string) {
    if (USE_FIREBASE) {
      try {
        const { deleteOrderFromFirestore } = await getAdapter();
        await deleteOrderFromFirestore(id);
        return;
      } catch (err) {
        console.warn("Firestore deleteOrder failed. Using local fallback.", err);
      }
    }
    const orders = await readData(ordersFile, []);
    const filtered = orders.filter((o: any) => o.id !== id);
    await writeData(ordersFile, filtered);
  },

  async getPendingOrdersCount() {
    if (USE_FIREBASE) {
      try {
        const { getPendingOrdersCount } = await getAdapter();
        return await getPendingOrdersCount();
      } catch (err) {
        console.warn("Firestore getPendingOrdersCount failed. Using local fallback.", err);
      }
    }
    const orders = await readData(ordersFile, []);
    return orders.filter((o: any) => o.orderStatus === "pending").length;
  },

  // Products — per-request deduplication handles performance while ensuring absolutely fresh data globally
  getProducts: cache(async function() {
    let products = null;
    if (USE_FIREBASE) {
      try {
        const { getProductsFromFirestore } = await getAdapter();
        products = await getProductsFromFirestore();
      } catch (err) {
        console.warn("Firestore products fetch failed. Using local fallback.", err);
      }
    }

    if (!products || products.length === 0) {
      products = await readData(productsFile, []);
    }

    if (!products || products.length === 0) {
      products = FALLBACK_PRODUCTS;
    }

    return products;
  }),

  async createProduct(data: any) {
    if (USE_FIREBASE) {
      try {
        const { createProductInFirestore } = await getAdapter();
        return await createProductInFirestore(data);
      } catch (err) {
        console.warn("Firestore createProduct failed. Using local fallback.", err);
      }
    }
    const products = await readData(productsFile, []);
    const newProduct = { id: crypto.randomUUID(), ...data };
    products.push(newProduct);
    await writeData(productsFile, products);
    revalidatePath("/");
    revalidatePath("/shop");
    return newProduct;
  },

  async updateProduct(id: string, data: any) {
    if (USE_FIREBASE) {
      try {
        const { updateProductInFirestore } = await getAdapter();
        await updateProductInFirestore(id, data);
      } catch (err) {
        console.warn("Firestore updateProduct failed. Using local fallback.", err);
      }
    }
    const products = await readData(productsFile, []);
    const idx = products.findIndex((p: any) => p.id === id);
    if (idx !== -1) {
      products[idx] = { ...products[idx], ...data };
      await writeData(productsFile, products);
      revalidatePath("/");
      revalidatePath("/shop");
    }
    return { success: true };
  },

  async deleteProduct(id: string) {
    if (USE_FIREBASE) {
      try {
        const { deleteProductFromFirestore } = await getAdapter();
        await deleteProductFromFirestore(id);
      } catch (err) {
        console.warn("Firestore deleteProduct failed. Using local fallback.", err);
      }
    }
    const products = await readData(productsFile, []);
    const filtered = products.filter((p: any) => p.id !== id);
    await writeData(productsFile, filtered);
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/admin/products");
    revalidatePath("/api/products");
    return { success: true };
  },

  // ── Notifications ─────────────────────────────────────────────────────
  async getNotifications(recipient: string = "admin", limit: number = 20) {
    if (USE_FIREBASE) {
      try {
        const { getNotifications } = await getAdapter();
        return await getNotifications(recipient, limit);
      } catch (err) {
        console.warn("Firestore notifications fetch failed.", err);
      }
    }
    return [];
  },

  async markNotificationAsRead(id: string) {
    if (USE_FIREBASE) {
      try {
        const { markNotificationAsRead } = await getAdapter();
        return await markNotificationAsRead(id);
      } catch (err) {
        console.warn("Firestore markNotificationAsRead failed.", err);
      }
    }
  },

  async markAllNotificationsAsRead(recipient: string = "admin") {
    if (USE_FIREBASE) {
      try {
        const { markAllNotificationsAsRead } = await getAdapter();
        return await markAllNotificationsAsRead(recipient);
      } catch (err) {
        console.warn("Firestore markAllNotificationsAsRead failed.", err);
      }
    }
  },

  async deleteNotification(id: string) {
    if (USE_FIREBASE) {
      try {
        const { deleteNotification } = await getAdapter();
        return await deleteNotification(id);
      } catch (err) {
        console.warn("Firestore deleteNotification failed.", err);
      }
    }
  },

  async clearAllNotifications(recipient: string = "admin") {
    if (USE_FIREBASE) {
      try {
        const { clearAllNotifications } = await getAdapter();
        return await clearAllNotifications(recipient);
      } catch (err) {
        console.warn("Firestore clearAllNotifications failed.", err);
      }
    }
  },

  async savePushToken(uid: string, token: string) {
    if (USE_FIREBASE) {
      try {
        const { savePushTokenInFirestore } = await getAdapter();
        return await savePushTokenInFirestore(uid, token);
      } catch (err) {
        console.warn("Firestore savePushToken failed.", err);
      }
    }
  },

  // ── User Profiles (ULTIMATE RESILIENCE STRATEGY) ──────────────────────
  async getUserProfile(uid: string) {
    let result = null;

    if (USE_FIREBASE) {
      try {
        const adapter = await getAdapter();
        
        // 1. Try Firestore (Primary)
        result = await adapter.getUserProfileFromFirestore(uid);
        if (result) return result;

        // 2. Try RTDB (Stable Server Backup)
        result = await adapter.getUserProfileFromRTDB(uid);
        if (result) return result;
        
      } catch (err: any) {
        console.warn(`[Storage] Firebase fetch skipped. ${err.message}`);
      }
    }

    // 3. Fallback to local files
    const profiles = await readData(profilesFile, {});
    return (profiles as any)[uid] || null;
  },

  async getCustomersCount() {
    if (USE_FIREBASE) {
      try {
        const { getCustomersCountInFirestore } = await getAdapter();
        return await getCustomersCountInFirestore();
      } catch (err) {
        console.warn("Firestore getCustomersCount failed. Using local fallback.", err);
      }
    }
    const profiles = await readData(profilesFile, {});
    return Object.keys(profiles).length;
  },

  async updateUserProfile(uid: string, data: any) {
    // 1. ALWAYS write to Local JSON (Backup truth for local servers)
    // Wrap in try-catch to be Vercel (Read-only disk) compatible
    try {
      const profiles = await readData(profilesFile, {});
      (profiles as any)[uid] = { ...(profiles as any)[uid], ...data, updatedAt: new Date().toISOString() };
      await writeData(profilesFile, profiles);
    } catch (e) {}

    // 2. Sync with Cloud Firebase
    if (USE_FIREBASE) {
      try {
        const adapter = await getAdapter();
        
        // A. Sync to Firestore (Global primary)
        await adapter.updateUserProfileInFirestore(uid, data).catch(err => {
            console.warn(`[Storage] Firestore sync failed: ${err.message}`);
        });

        // B. Sync to RTDB (Global secondary / quota-safe)
        await adapter.updateUserProfileInRTDB(uid, data).catch(err => {
            console.warn(`[Storage] RTDB sync failed: ${err.message}`);
        });

      } catch (err: any) {
        console.warn(`[Storage] Cloud sync failed. Working with local backup.`);
      }
    }
  },

  // ── Media Storage (ImgBB Metadata Sync) ──────────────────────────────
  async getMedia() {
    let result = null;
    if (USE_FIREBASE) {
      try {
        const adapter = await getAdapter();
        // 1. Try Firestore
        const snap = await adapter.adminDb.collection("media").orderBy("uploadedAt", "desc").get();
        if (!snap.empty) return snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));

        // 2. Try RTDB Fallback
        const rtdb = adapter.getAdminRtDb();
        const rtsnap = await rtdb.ref("media").get();
        if (rtsnap.exists()) {
           const data = rtsnap.val();
           return Object.values(data).sort((a: any, b: any) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
        }
      } catch (err) {
        console.warn("[Media Store] Cloud fetch failed. Using local fallback.", err);
      }
    }
    // 3. Local JSON Fallback
    return await readData(path.join(process.cwd(), 'data', 'media.json'), []);
  },

  async saveMedia(mediaData: any) {
    // A. Local Backup
    try {
      const mediaFile = path.join(process.cwd(), 'data', 'media.json');
      const list = await readData(mediaFile, []);
      list.unshift({ ...mediaData, id: crypto.randomUUID() });
      await writeData(mediaFile, list);
    } catch (e) {}

    // B. Cloud Sync
    if (USE_FIREBASE) {
      try {
        const adapter = await getAdapter();
        // 1. Firestore
        await adapter.adminDb.collection("media").add({
          ...mediaData,
          uploadedAt: new Date().toISOString()
        });
        // 2. RTDB
        const rtdb = adapter.getAdminRtDb();
        await rtdb.ref("media").push({
          ...mediaData,
          uploadedAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn("[Media Store] Cloud sync failed.", err);
      }
    }
  },

  async deleteMedia(filename: string) {
    // A. Local
    try {
       const mediaFile = path.join(process.cwd(), 'data', 'media.json');
       const list = await readData(mediaFile, []);
       const filtered = list.filter((m: any) => m.name !== filename);
       await writeData(mediaFile, filtered);
    } catch (e) {}

    // B. Cloud
    if (USE_FIREBASE) {
      try {
        const adapter = await getAdapter();
        // 1. Firestore
        const snap = await adapter.adminDb.collection("media").where("name", "==", filename).get();
        const batch = adapter.adminDb.batch();
        snap.docs.forEach((d: any) => batch.delete(d.ref));
        await batch.commit();

        // 2. RTDB
        const rtdb = adapter.getAdminRtDb();
        const rtsnap = await rtdb.ref("media").orderByChild("name").equalTo(filename).get();
        if (rtsnap.exists()) {
           rtsnap.forEach((child: any) => {
             child.ref.remove();
             return true; // continue iteration
           });
        }
      } catch (err) {
        console.warn("[Media Store] Cloud delete failed.", err);
      }
    }
  },

  // ── TRAFFIC STATS ──
  // ... existing traffic methods ...
  async incrementTraffic() {
    if (USE_FIREBASE) {
      try {
        const { incrementTrafficCount } = await getAdapter();
        await incrementTrafficCount();
      } catch (err) {
        console.warn("Firestore traffic increment failed.", err);
      }
    }
  },

  async getTraffic() {
    if (USE_FIREBASE) {
      try {
        const { getTrafficCount } = await getAdapter();
        return await getTrafficCount();
      } catch (err) {
        console.warn("Firestore traffic count failed.", err);
      }
    }
    return 0;
  }
};
