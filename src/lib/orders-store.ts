import fs from "fs";
import path from "path";
import os from "os";
import { Order } from "@/types";

// Determine data directory: use OS temp dir on serverless/Vercel, otherwise local /data
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NODE_ENV === "production");
const DATA_DIR = isServerless
  ? path.join(os.tmpdir(), "ilai-data")
  : path.join(process.cwd(), "data");

const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const COUNTER_FILE = path.join(DATA_DIR, "order-counter.json");

// In-memory fallback cache across lambda invocations in the same container
declare global {
  // eslint-disable-next-line no-var
  var __inMemoryOrders: Order[] | undefined;
}

if (!globalThis.__inMemoryOrders) {
  globalThis.__inMemoryOrders = [];
}

export function getNextLocalOrderNumber(): string {
  ensureFileExists();
  const year = new Date().getFullYear();
  let nextSeq = 1;

  try {
    if (fs.existsSync(COUNTER_FILE)) {
      const data = JSON.parse(fs.readFileSync(COUNTER_FILE, "utf8"));
      if (typeof data.nextSeq === "number" && !isNaN(data.nextSeq)) {
        nextSeq = data.nextSeq;
      }
    }
  } catch (err) {
    console.warn("Could not read order counter file:", err);
  }

  // Format: ILAI-2026-0001
  const seqPadded = String(nextSeq).padStart(4, "0");
  const orderNumber = `ILAI-${year}-${seqPadded}`;

  // Advance counter atomically
  try {
    fs.writeFileSync(
      COUNTER_FILE,
      JSON.stringify(
        { nextSeq: nextSeq + 1, lastGenerated: orderNumber, updatedAt: new Date().toISOString() },
        null,
        2
      ),
      "utf8"
    );
  } catch (err) {
    console.warn("Could not save order counter file:", err);
  }

  return orderNumber;
}

function ensureFileExists() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const seedFile = path.join(process.cwd(), "data", "orders.json");
    if (!fs.existsSync(ORDERS_FILE) || fs.readFileSync(ORDERS_FILE, "utf8").trim() === "[]") {
      if (fs.existsSync(seedFile)) {
        fs.copyFileSync(seedFile, ORDERS_FILE);
      } else {
        fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2), "utf8");
      }
    }
  } catch (err) {
    console.warn("Could not ensure orders file exists:", err);
  }
}

export function getAllLocalOrders(): Order[] {
  try {
    ensureFileExists();
    if (fs.existsSync(ORDERS_FILE)) {
      const content = fs.readFileSync(ORDERS_FILE, "utf8");
      const diskOrders = JSON.parse(content) || [];
      const mergedMap = new Map<string, Order>();
      (globalThis.__inMemoryOrders || []).forEach((o) => mergedMap.set(o.id || o.order_number, o));
      diskOrders.forEach((o: Order) => mergedMap.set(o.id || o.order_number, o));
      return Array.from(mergedMap.values());
    }
  } catch (err) {
    console.warn("Error reading local orders file:", err);
  }
  return globalThis.__inMemoryOrders || [];
}

export function saveLocalOrder(order: Order): void {
  if (!globalThis.__inMemoryOrders) globalThis.__inMemoryOrders = [];
  const memIdx = globalThis.__inMemoryOrders.findIndex(
    (o) => o.id === order.id || o.order_number === order.order_number
  );
  if (memIdx >= 0) {
    globalThis.__inMemoryOrders[memIdx] = {
      ...globalThis.__inMemoryOrders[memIdx],
      ...order,
      updated_at: new Date().toISOString(),
    };
  } else {
    globalThis.__inMemoryOrders.unshift(order);
  }

  try {
    ensureFileExists();
    const orders = getAllLocalOrders();
    const existingIndex = orders.findIndex(
      (o) => o.id === order.id || o.order_number === order.order_number
    );
    if (existingIndex >= 0) {
      orders[existingIndex] = { ...orders[existingIndex], ...order, updated_at: new Date().toISOString() };
    } else {
      orders.unshift(order);
    }
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf8");
  } catch (err) {
    console.warn("Error saving local order to disk:", err);
  }
}

export function getLocalOrder(idOrOrderNumberOrToken: string): Order | null {
  try {
    const orders = getAllLocalOrders();
    const cleanId = (idOrOrderNumberOrToken || "").trim().toLowerCase();
    const match = orders.find(
      (o) =>
        (o.id && o.id.toLowerCase() === cleanId) ||
        (o.confirmation_token && o.confirmation_token.toLowerCase() === cleanId) ||
        (o.order_number && o.order_number.toLowerCase() === cleanId)
    );
    return match || null;
  } catch (err) {
    return null;
  }
}

export const updateLocalOrderStatus = updateLocalOrder;
export function updateLocalOrder(
  idOrOrderNumber: string,
  updates: Partial<Order>,
  note?: string
): Order | null {
  try {
    ensureFileExists();
    const orders = getAllLocalOrders();
    const cleanId = (idOrOrderNumber || "").trim().toLowerCase();
    const index = orders.findIndex(
      (o) =>
        (o.id && o.id.toLowerCase() === cleanId) ||
        (o.confirmation_token && o.confirmation_token.toLowerCase() === cleanId) ||
        (o.order_number && o.order_number.toLowerCase() === cleanId)
    );

    if (index === -1) return null;

    const existing = orders[index];
    const history = existing.order_status_history || [];

    if (note || updates.order_status) {
      history.push({
        id: `hist-${Date.now()}`,
        order_id: existing.id,
        status: updates.order_status || existing.order_status,
        note: note || `Order updated to ${updates.order_status || existing.order_status}`,
        created_at: new Date().toISOString(),
      });
    }

    const updated: Order = {
      ...existing,
      ...updates,
      order_status_history: history,
      updated_at: new Date().toISOString(),
    };

    orders[index] = updated;
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf8");
    return updated;
  } catch (err) {
    console.warn("Error updating local order:", err);
    return null;
  }
}
