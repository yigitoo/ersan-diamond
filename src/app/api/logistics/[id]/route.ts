import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { requireRole } from "@/lib/auth";
import Delivery from "@/lib/db/models/delivery";
import { successResponse, errorResponse } from "@/lib/utils/api-response";

const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["ASSIGNED", "CANCELLED"],
  ASSIGNED: ["PICKED_UP", "CANCELLED"],
  PICKED_UP: ["IN_TRANSIT", "CANCELLED"],
  IN_TRANSIT: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
};

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(["OWNER", "ADMIN", "SALES"]);
    await connectDB();

    const { id } = await params;

    const delivery = await Delivery.findById(id)
      .populate("productId", "brand model slug images category salePrice currency")
      .populate("courierId", "name email phoneInternal")
      .populate("createdById", "name email")
      .populate("statusHistory.userId", "name email")
      .lean();

    if (!delivery) return errorResponse("Teslimat bulunamadı", 404);

    return successResponse(delivery);
  } catch (error: any) {
    return errorResponse(error.message || "Teslimat yüklenemedi", 403);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRole(["OWNER", "ADMIN", "SALES"]);
    await connectDB();

    const { id } = await params;
    const body = await req.json();

    const delivery = await Delivery.findById(id);
    if (!delivery) return errorResponse("Teslimat bulunamadı", 404);

    // Status change with validation
    if (body.status && body.status !== delivery.status) {
      const allowed = VALID_TRANSITIONS[delivery.status] || [];
      if (!allowed.includes(body.status)) {
        return errorResponse(`Geçersiz durum geçişi: ${delivery.status} → ${body.status}`, 400);
      }

      delivery.status = body.status;
      delivery.statusHistory.push({
        status: body.status,
        timestamp: new Date(),
        note: body.statusNote || undefined,
        userId: user.id,
      });

      if (body.status === "DELIVERED") {
        delivery.deliveredAt = new Date();
      }
    }

    // Courier assignment
    if (body.courierId !== undefined) {
      delivery.courierId = body.courierId || undefined;
      if (body.courierId && delivery.status === "PENDING") {
        delivery.status = "ASSIGNED";
        delivery.statusHistory.push({
          status: "ASSIGNED",
          timestamp: new Date(),
          note: "Kurye atandı",
          userId: user.id,
        });
      }
    }

    // Other field updates
    if (body.priority) delivery.priority = body.priority;
    if (body.scheduledDate) delivery.scheduledDate = body.scheduledDate;
    if (body.timeSlot) delivery.timeSlot = body.timeSlot;
    if (body.recipientName) delivery.recipientName = body.recipientName;
    if (body.recipientPhone) delivery.recipientPhone = body.recipientPhone;
    if (body.recipientEmail !== undefined) delivery.recipientEmail = body.recipientEmail;
    if (body.deliveryAddress) delivery.deliveryAddress = body.deliveryAddress;
    if (body.pickupAddress) delivery.pickupAddress = body.pickupAddress;
    if (body.adminNotes !== undefined) delivery.adminNotes = body.adminNotes;
    if (body.courierNotes !== undefined) delivery.courierNotes = body.courierNotes;
    if (body.specialInstructions !== undefined) delivery.specialInstructions = body.specialInstructions;
    if (body.proofOfDelivery) delivery.proofOfDelivery = body.proofOfDelivery;

    await delivery.save();

    const updated = await Delivery.findById(id)
      .populate("productId", "brand model slug images category salePrice currency")
      .populate("courierId", "name email phoneInternal")
      .populate("createdById", "name email")
      .populate("statusHistory.userId", "name email")
      .lean();

    return successResponse(updated);
  } catch (error: any) {
    return errorResponse(error.message || "Teslimat güncellenemedi", 400);
  }
}
