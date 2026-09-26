import fs from "fs";
import path from "path";
import { Order } from "@/types";

const DATA_DIR = path.join(process.cwd(), "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const COUNTER_FILE = path.join(DATA_DIR, "order-counter.json");

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
    if (!fs.existsSync(ORDERS_FILE)) {
      fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2), "utf8");
    }
  } catch (err) {
    console.warn("Could not ensure orders file exists:", err);
  }
}

export function getAllLocalOrders(): Order[] {
  try {
    ensureFileExists();
    const content = fs.readFileSync(ORDERS_FILE, "utf8");
    return JSON.parse(content) || [];
  } catch (err) {
    console.warn("Error reading local orders file:", err);
    return [];
  }
}

export function saveLocalOrder(order: Order): void {
  try {
    ensureFileExists();
    const orders = getAllLocalOrders();
    const existingIndex = orders.findIndex(
      (o) => o.id === order.id || o.order_number === order.order_number
    );
    if (existingIndex >= 0) {
      orders[existingIndex] = { ...orders[existingIndex], ...order, updated_at: new Date().toISOString() };
    } else {
      orders.unshift(order); // Add to top
    }
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf8");
  } catch (err) {
    console.warn("Error saving local order:", err);
  }
}

export function getLocalOrder(idOrOrderNumber: string): Order | null {
  try {
    const orders = getAllLocalOrders();
    const cleanId = (idOrOrderNumber || "").trim().toLowerCase();
    const match = orders.find(
      (o) =>
        (o.id && o.id.toLowerCase() === cleanId) ||
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
