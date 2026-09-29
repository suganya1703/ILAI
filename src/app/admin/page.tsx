"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Package, 
  Search, 
  Download, 
  Settings, 
  RefreshCw, 
  LogOut, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Edit, 
  Filter,
  Eye,
  Check,
  CreditCard,
  QrCode,
  Banknote,
  Send
} from "lucide-react";
import { Order, OrderStatus, PaymentStatus } from "@/types";
import { formatINR } from "@/lib/utils";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Live order & online payment statistics
  const [stats, setStats] = useState<{
    totalUpiOrders: number;
    upiPaidOrders: number;
    upiPendingOrders: number;
    totalCodOrders: number;
    paidUpiRevenue: number;
    codRevenue: number;
    totalRevenue: number;
    totalOrders: number;
  } | null>(null);

  // Status & Payment update modal state
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>("Confirmed");
  const [newPaymentStatus, setNewPaymentStatus] = useState<PaymentStatus>("Pending verification");
  const [courierName, setCourierName] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [updating, setUpdating] = useState(false);

  const statusOptions: OrderStatus[] = [
    "Pending verification",
    "Pending confirmation",
    "Confirmed",
    "Packed",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];

  // Check auth session
  useEffect(() => {
    const session = localStorage.getItem("ilai_admin_session");
    if (!session) {
      router.push("/admin/login");
    } else {
      fetchOrders();
    }
  }, [router]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let url = `/api/admin/orders?status=${encodeURIComponent(statusFilter)}`;
      if (searchQuery.trim()) {
        url += `&q=${encodeURIComponent(searchQuery.trim())}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (e) {
      console.error("Fetch admin orders error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleOpenEditModal = (order: Order) => {
    setEditingOrder(order);
    setNewStatus(order.order_status);
    setNewPaymentStatus(order.payment_status || "Pending verification");
    setCourierName(order.courier_name || "");
    setTrackingNumber(order.tracking_number || "");
    setDeliveryNote("");
    setSendEmail(true);
  };

  // Quick action: Mark Order as Paid after manual verification in UPI app
  const handleQuickMarkPaid = async (order: Order) => {
    const customNote = prompt(
      `Enter delivery details / confirmation note for Order ${order.order_number}:\n(e.g., Estimated dispatch within 24 hours via Express Courier)`,
      "Estimated delivery in 2-5 working days across Tamil Nadu."
    );

    if (customNote === null) return; // User cancelled prompt

    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_status: "Paid",
          status: "Confirmed",
          delivery_note: customNote,
          note: `Payment manually verified as Paid by admin at ${new Date().toLocaleString("en-IN")}`,
          send_confirmation_email: true,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(`Order ${order.order_number} marked as Paid! Confirmation email sent to ${order.customer_email}.`);
        fetchOrders();
      } else {
        alert(data.error || "Failed to update payment status");
      }
    } catch (err) {
      alert("Error marking payment as Paid");
    } finally {
      setUpdating(false);
    }
  };

  // Quick action: Confirm COD order
  const handleQuickConfirmCod = async (order: Order) => {
    const customNote = prompt(
      `Confirm Cash on Delivery Order ${order.order_number}:\nEnter dispatch details or note:`,
      "COD Order confirmed. Preparing package for dispatch."
    );

    if (customNote === null) return; // User cancelled prompt

    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Confirmed",
          delivery_note: customNote,
          note: `COD Order confirmed by admin at ${new Date().toLocaleString("en-IN")}`,
          send_confirmation_email: true,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(`Order ${order.order_number} confirmed! Email notification sent.`);
        fetchOrders();
      } else {
        alert(data.error || "Failed to confirm order");
      }
    } catch (err) {
      alert("Error confirming COD order");
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    setUpdating(true);

    try {
      const res = await fetch(`/api/admin/orders/${editingOrder.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          payment_status: newPaymentStatus,
          courier_name: courierName,
          tracking_number: trackingNumber,
          delivery_note: deliveryNote,
          note: deliveryNote || `Updated status to ${newStatus}, payment: ${newPaymentStatus}`,
          send_confirmation_email: sendEmail && newPaymentStatus === "Paid",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setEditingOrder(null);
        fetchOrders();
      } else {
        alert(data.error || "Failed to update order");
      }
    } catch (err) {
      alert("Error updating order");
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("ilai_admin_session");
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-[#F6F2E6] text-[#263618] p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Admin Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E2DCCB] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#263618]">ILAI Admin Dashboard</h1>
            <span className="text-xs bg-[#EDE8D8] text-[#506638] px-2.5 py-0.5 rounded-full font-bold border border-[#E2DCCB]">
              Order & Payment Verification
            </span>
          </div>
          <p className="text-xs text-[#5F6F50] mt-1">
            Manage orders, verify manual UPI payments, and send customer delivery confirmations.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => fetchOrders()}
            disabled={loading}
            className="px-4 py-2.5 bg-[#F6F2E6] hover:bg-[#EDE8D8] text-[#263618] text-xs font-bold rounded-xl border border-[#E2DCCB] transition-colors flex items-center justify-center gap-2"
            title="Refresh Orders & Live Stats"
          >
            <RefreshCw className={`w-4 h-4 text-[#506638] ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <Link
            href="/admin/settings"
            className="flex-1 sm:flex-none px-4 py-2.5 bg-[#F6F2E6] hover:bg-[#EDE8D8] text-[#263618] text-xs font-bold rounded-xl border border-[#E2DCCB] transition-colors flex items-center justify-center gap-2"
          >
            <Settings className="w-4 h-4 text-[#506638]" />
            <span>Store Settings</span>
          </Link>
          <button
            onClick={handleLogout}
            className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl border border-red-200 transition-colors flex items-center justify-center gap-2"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Online Payment & Order Summary Cards (Live from Supabase) */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#506638]">
              Live Payment & Order Summary
            </h2>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
              Live Data
            </span>
          </div>
          {stats && (
            <span className="text-[11px] text-[#5F6F50]">
              All-Time Total: <strong>{stats.totalOrders} orders</strong> • <strong>{formatINR(stats.totalRevenue)}</strong>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total UPI / GPay Orders */}
          <div className="bg-white p-5 rounded-2xl border border-[#E2DCCB] shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#5F6F50] uppercase tracking-wider">
                UPI / GPay Orders
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#EDE8D8] text-[#506638] flex items-center justify-center">
                <QrCode className="w-4 h-4" />
              </div>
            </div>
            <div className="my-2">
              <div className="text-3xl font-black text-[#263618]">
                {stats ? stats.totalUpiOrders : "—"}
              </div>
              <p className="text-[11px] text-[#5F6F50] mt-0.5">Total online orders received</p>
            </div>
            <div className="pt-2.5 border-t border-[#E2DCCB]/60 flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200">
                <Check className="w-3 h-3 text-emerald-600" />
                {stats ? stats.upiPaidOrders : 0} Paid
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md border border-amber-200">
                <Clock className="w-3 h-3 text-amber-600" />
                {stats ? stats.upiPendingOrders : 0} Pending
              </span>
            </div>
          </div>

          {/* Card 2: Cash on Delivery Orders */}
          <div className="bg-white p-5 rounded-2xl border border-[#E2DCCB] shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#5F6F50] uppercase tracking-wider">
                Total COD Orders
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#EDE8D8] text-[#506638] flex items-center justify-center">
                <Banknote className="w-4 h-4" />
              </div>
            </div>
            <div className="my-2">
              <div className="text-3xl font-black text-[#263618]">
                {stats ? stats.totalCodOrders : "—"}
              </div>
              <p className="text-[11px] text-[#5F6F50] mt-0.5">Cash on delivery orders received</p>
            </div>
            <div className="pt-2.5 border-t border-[#E2DCCB]/60 flex items-center justify-between text-[11px] text-[#5F6F50]">
              <span>Payment:</span>
              <span className="font-bold text-[#263618]">Doorstep Cash</span>
            </div>
          </div>

          {/* Card 3: Paid Online Revenue */}
          <div className="bg-white p-5 rounded-2xl border border-[#E2DCCB] shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#5F6F50] uppercase tracking-wider">
                Paid UPI Revenue
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="my-2">
              <div className="text-3xl font-black text-emerald-800">
                {stats ? formatINR(stats.paidUpiRevenue) : "—"}
              </div>
              <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                From {stats ? stats.upiPaidOrders : 0} verified UPI payments
              </p>
            </div>
            <div className="pt-2.5 border-t border-[#E2DCCB]/60 flex items-center justify-between text-[11px] text-[#5F6F50]">
              <span>Status:</span>
              <span className="font-bold text-emerald-700">Verified & Realized</span>
            </div>
          </div>

          {/* Card 4: COD Revenue */}
          <div className="bg-white p-5 rounded-2xl border border-[#E2DCCB] shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#5F6F50] uppercase tracking-wider">
                COD Order Value
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#EDE8D8] text-[#506638] flex items-center justify-center">
                <Truck className="w-4 h-4" />
              </div>
            </div>
            <div className="my-2">
              <div className="text-3xl font-black text-[#263618]">
                {stats ? formatINR(stats.codRevenue) : "—"}
              </div>
              <p className="text-[11px] text-[#5F6F50] mt-0.5">
                From {stats ? stats.totalCodOrders : 0} COD orders
              </p>
            </div>
            <div className="pt-2.5 border-t border-[#E2DCCB]/60 flex items-center justify-between text-[11px] text-[#5F6F50]">
              <span>Collection:</span>
              <span className="font-bold text-[#506638]">Payable on Delivery</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2DCCB] shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {["All", "Pending verification", "Pending confirmation", "Confirmed", "Packed", "Shipped", "Delivered", "Cancelled"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === st
                  ? "bg-[#506638] text-white shadow-sm"
                  : "bg-white text-[#5F6F50] hover:bg-[#EDE8D8] border border-[#E2DCCB]"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-md w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#5F6F50] absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Order ID, Customer Name, or Mobile..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E2DCCB] text-xs focus:outline-none focus:border-[#506638] bg-[#F6F2E6]/50"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-[#506638] text-white font-bold rounded-xl text-xs hover:bg-[#3E512B] transition-colors shrink-0"
          >
            Search
          </button>
        </form>
      </div>

      {/* Orders Data Table */}
      <div className="bg-white rounded-2xl border border-[#E2DCCB] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[#5F6F50] text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#506638]" />
            <span>Loading orders list...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Package className="w-10 h-10 text-[#5F6F50]/40 mx-auto" />
            <p className="font-bold text-[#263618]">No Orders Found</p>
            <p className="text-xs text-[#5F6F50]">There are no orders matching filter &quot;{statusFilter}&quot;.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#263618]">
              <thead className="bg-[#EDE8D8]/70 text-[#263618] font-bold uppercase tracking-wider border-b border-[#E2DCCB]">
                <tr>
                  <th className="p-3.5 px-4">Order ID & Date</th>
                  <th className="p-3.5 px-4">Customer Details</th>
                  <th className="p-3.5 px-4">Payment Method</th>
                  <th className="p-3.5 px-4">Payment Status</th>
                  <th className="p-3.5 px-4">Total Amount</th>
                  <th className="p-3.5 px-4">Order Status</th>
                  <th className="p-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2DCCB]/60">
                {orders.map((o) => {
                  const isPendingUpi = (o.payment_method === "upi" || o.payment_method === "upi_gpay") && o.payment_status !== "Paid";
                  return (
                    <tr key={o.id} className="hover:bg-[#F6F2E6]/50 transition-colors">
                      <td className="p-3.5 px-4">
                        <span className="font-extrabold text-[#506638] block">{o.order_number}</span>
                        <span className="text-[10px] text-[#5F6F50]">
                          {new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </td>

                      <td className="p-3.5 px-4">
                        <p className="font-bold text-[#263618]">{o.customer_name}</p>
                        <p className="text-[11px] text-[#5F6F50]">{o.customer_email}</p>
                        <p className="text-[11px] text-[#5F6F50]">+91 {o.customer_mobile} • {o.city}</p>
                      </td>

                      {/* Payment Method Column */}
                      <td className="p-3.5 px-4 font-semibold">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F6F2E6] border border-[#E2DCCB] text-[#263618]">
                          {o.payment_method === "cod" ? (
                            <>
                              <Banknote className="w-3.5 h-3.5 text-[#506638]" />
                              <span>Cash on Delivery</span>
                            </>
                          ) : (
                            <>
                              <QrCode className="w-3.5 h-3.5 text-[#506638]" />
                              <span>UPI / GPay</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Payment Status Column */}
                      <td className="p-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase inline-flex items-center gap-1 border ${
                          o.payment_status === "Paid" || o.payment_status === "paid"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                            : "bg-amber-100 text-amber-900 border-amber-300"
                        }`}>
                          {o.payment_status === "Paid" || o.payment_status === "paid" ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Paid</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>{o.payment_status || "Pending verification"}</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Total Amount Column */}
                      <td className="p-3.5 px-4 font-extrabold text-[#506638] text-sm">
                        {formatINR(o.total_amount)}
                      </td>

                      {/* Order Status Column */}
                      <td className="p-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase bg-[#EDE8D8] text-[#506638] border border-[#E2DCCB]">
                          {o.order_status}
                        </span>
                      </td>

                      {/* Actions Column */}
                      <td className="p-3.5 px-4 text-right space-x-2">
                        {/* Quick Mark as Paid Button for UPI */}
                        {isPendingUpi && (
                          <button
                            onClick={() => handleQuickMarkPaid(o)}
                            className="px-3 py-1.5 bg-emerald-700 text-white font-bold rounded-xl hover:bg-emerald-800 transition-all text-xs shadow-sm inline-flex items-center gap-1 animate-pulse"
                            title="Mark as Paid after manual UPI verification"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Verify & Mark Paid</span>
                          </button>
                        )}

                        {/* Quick Confirm Button for COD */}
                        {o.payment_method === "cod" && (o.order_status === "Pending confirmation" || o.order_status === "Pending") && (
                          <button
                            onClick={() => handleQuickConfirmCod(o)}
                            className="px-3 py-1.5 bg-[#506638] text-white font-bold rounded-xl hover:bg-[#3E512B] transition-all text-xs shadow-sm inline-flex items-center gap-1"
                            title="Confirm Cash on Delivery Order"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Confirm Order</span>
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="px-2.5 py-1.5 bg-[#F6F2E6] text-[#263618] font-bold rounded-xl hover:bg-[#EDE8D8] border border-[#E2DCCB] transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5 inline" />
                        </button>

                        <button
                          onClick={() => handleOpenEditModal(o)}
                          className="px-3 py-1.5 bg-[#506638] text-white font-bold rounded-xl hover:bg-[#3E512B] transition-colors text-xs"
                          title="Update Order & Payment Status"
                        >
                          <Edit className="w-3.5 h-3.5 inline mr-1" />
                          <span>Update</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto border border-[#E2DCCB]">
            <div className="flex items-center justify-between border-b border-[#E2DCCB] pb-4">
              <div>
                <h3 className="text-xl font-extrabold text-[#263618]">Order Details</h3>
                <p className="text-xs text-[#506638] font-bold">{selectedOrder.order_number}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-[#5F6F50] hover:text-[#263618] font-bold text-lg">✕</button>
            </div>

            <div className="space-y-4 text-xs text-[#263618]">
              <div className="bg-[#F6F2E6] p-4 rounded-2xl space-y-1.5 border border-[#E2DCCB]">
                <p className="font-bold text-sm text-[#263618]">{selectedOrder.customer_name}</p>
                <p><strong>Email:</strong> {selectedOrder.customer_email}</p>
                <p><strong>Mobile:</strong> +91 {selectedOrder.customer_mobile}</p>
                <p><strong>Address:</strong> {selectedOrder.address_line}, {selectedOrder.city}, {selectedOrder.state} - {selectedOrder.pincode}</p>
              </div>

              <div>
                <h4 className="font-bold text-[#263618] mb-2 text-xs uppercase tracking-wider">Ordered Items</h4>
                {selectedOrder.order_items?.map((item, i) => (
                  <div key={i} className="flex justify-between border-b border-[#E2DCCB]/60 py-2">
                    <span>{item.product_name} (Qty: {item.quantity} pack(s))</span>
                    <span className="font-bold">{formatINR(item.total_price)}</span>
                  </div>
                ))}
              </div>

              <div className="bg-[#EDE8D8] p-3 rounded-xl border border-[#E2DCCB] space-y-1">
                <div className="flex justify-between">
                  <span>Payment Method:</span>
                  <span className="font-bold">{selectedOrder.payment_method === 'cod' ? 'Cash on Delivery' : 'UPI / GPay'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Status:</span>
                  <span className="font-bold text-[#506638]">{selectedOrder.payment_status}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-[#263618] pt-1 border-t border-[#E2DCCB]">
                  <span>Total Amount:</span>
                  <span className="text-[#506638]">{formatINR(selectedOrder.total_amount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Status & Payment Modal */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-[#E2DCCB]">
            <div className="flex items-center justify-between border-b border-[#E2DCCB] pb-4">
              <div>
                <h3 className="text-lg font-bold text-[#263618]">Update Order & Verification</h3>
                <p className="text-xs text-[#506638] font-bold">{editingOrder.order_number} • {editingOrder.customer_name}</p>
              </div>
              <button onClick={() => setEditingOrder(null)} className="text-[#5F6F50] hover:text-[#263618] font-bold text-lg">✕</button>
            </div>

            <form onSubmit={handleUpdateStatusSubmit} className="space-y-4 text-xs">
              {/* Payment Status Dropdown */}
              <div className="space-y-1">
                <label className="block font-bold text-[#263618] uppercase tracking-wider">Payment Status</label>
                <select
                  value={newPaymentStatus}
                  onChange={(e) => setNewPaymentStatus(e.target.value as PaymentStatus)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2DCCB] text-xs font-bold bg-[#F6F2E6] text-[#263618]"
                >
                  <option value="Pending verification">Pending verification</option>
                  <option value="Paid">Paid (Verified)</option>
                  <option value="Cash on Delivery">Cash on Delivery</option>
                  <option value="Pending confirmation">Pending confirmation</option>
                  <option value="Pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              {/* Order Status Dropdown */}
              <div className="space-y-1">
                <label className="block font-bold text-[#263618] uppercase tracking-wider">Order Progress Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2DCCB] text-xs font-bold bg-white"
                >
                  {statusOptions.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              {/* Courier Name */}
              <div className="space-y-1">
                <label className="block font-bold text-[#263618] uppercase tracking-wider">Courier Name</label>
                <input
                  type="text"
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  placeholder="e.g. BlueDart / India Post / ST Courier"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2DCCB] text-xs"
                />
              </div>

              {/* Courier Tracking Number */}
              <div className="space-y-1">
                <label className="block font-bold text-[#263618] uppercase tracking-wider">Tracking Number</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. BD123456789IN"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2DCCB] text-xs font-mono"
                />
              </div>

              {/* Delivery / Confirmation Note */}
              <div className="space-y-1">
                <label className="block font-bold text-[#263618] uppercase tracking-wider">Delivery Note / Confirmation Text</label>
                <textarea
                  rows={2}
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  placeholder="e.g. Payment verified. Order dispatched via ST Courier. Expected delivery 2-3 days."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2DCCB] text-xs"
                />
              </div>

              {/* Send Email Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="sendEmail"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  className="w-4 h-4 text-[#506638] rounded focus:ring-[#506638]"
                />
                <label htmlFor="sendEmail" className="text-xs font-semibold text-[#263618]">
                  Send Payment Confirmation Email to customer ({editingOrder.customer_email})
                </label>
              </div>

              <button
                type="submit"
                disabled={updating}
                className="w-full py-3 bg-[#506638] text-white font-bold rounded-xl hover:bg-[#3E512B] transition-colors shadow-md text-xs flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{updating ? "Updating..." : "Save Status & Send Confirmation Email"}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
