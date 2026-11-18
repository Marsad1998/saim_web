import { NextRequest, NextResponse } from "next/server";
import { verifyJwtToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ status: false, message: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyJwtToken(token);
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ status: false, message: "Admin privileges required" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const variant = formData.get("variant") as string | null || "logo";

    if (!file) {
      return NextResponse.json({ status: false, message: "No file uploaded" }, { status: 400 });
    }

    // Allowed extensions / mime types
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml", "image/webp", "image/x-icon", "image/vnd.microsoft.icon"];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      return NextResponse.json({
        status: false,
        message: "Invalid image format. Allowed: PNG, JPEG, SVG, WebP, ICO.",
      }, { status: 400 });
    }

    // Ensure upload dir exists
    const uploadDir = path.join(process.cwd(), "public", "uploads", "branding");
    await fs.mkdir(uploadDir, { recursive: true });

    // Sanitize extension and filename
    let ext = path.extname(file.name).toLowerCase();
    if (!ext) {
      if (file.type.includes("png")) ext = ".png";
      else if (file.type.includes("svg")) ext = ".svg";
      else if (file.type.includes("webp")) ext = ".webp";
      else if (file.type.includes("icon")) ext = ".ico";
      else ext = ".jpg";
    }

    const cleanPrefix = variant.replace(/[^a-zA-Z0-9_-]/g, "");
    const filename = `${cleanPrefix}-${Date.now()}${ext}`;
    const filePath = path.join(uploadDir, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/branding/${filename}`;

    return NextResponse.json({
      status: true,
      message: "Logo uploaded successfully!",
      url: publicUrl,
      filename,
    });
  } catch (error: any) {
    console.error("POST /api/admin/settings/upload error:", error);
    return NextResponse.json({ status: false, message: error.message || "Failed to upload file" }, { status: 500 });
  }
}
