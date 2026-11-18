import { NextRequest, NextResponse } from "next/server";
import { verifyJwtToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { DriverModel } from "@/models/Driver";
import fs from "fs";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ status: false, message: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyJwtToken(token);
    if (!payload?.userId) {
      return NextResponse.json({ status: false, message: "Invalid session" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const docType = formData.get("docType") as string | null;

    if (!file || !docType) {
      return NextResponse.json(
        { status: false, message: "File and document type are required." },
        { status: 400 }
      );
    }

    // Allowed file types: Images & PDFs
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { status: false, message: "Unsupported file type. Please upload a JPG, PNG, WEBP, or PDF." },
        { status: 400 }
      );
    }

    // Size limit: 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { status: false, message: "File size exceeds 10MB limit." },
        { status: 400 }
      );
    }

    // Determine extension
    let ext = "png";
    if (file.type === "image/jpeg") ext = "jpg";
    else if (file.type === "image/webp") ext = "webp";
    else if (file.type === "application/pdf") ext = "pdf";

    // Create target directory
    const uploadDir = path.join(process.cwd(), "public", "uploads", "driver_docs");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Safe filename
    const sanitizedDocType = docType.replace(/[^a-zA-Z0-9_]/g, "");
    const filename = `doc_${payload.userId.slice(-6)}_${sanitizedDocType}_${Date.now()}.${ext}`;
    const filePath = path.join(uploadDir, filename);

    // Write file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filePath, buffer);

    const fileUrl = `/uploads/driver_docs/${filename}`;

    // Update driver record with the new document URL
    let driver = await DriverModel.findByUserId(payload.userId);
    if (driver) {
      const updatePayload: any = {};
      if (docType === "pco_badge") updatePayload.docPcoBadge = fileUrl;
      else if (docType === "dvla_license") updatePayload.docDvlaLicense = fileUrl;
      else if (docType === "phv_mot") updatePayload.docPhvMot = fileUrl;
      else if (docType === "insurance") updatePayload.docInsurance = fileUrl;

      await DriverModel.update(driver.id, updatePayload);
    }

    return NextResponse.json({
      status: true,
      message: "Document uploaded successfully!",
      fileUrl,
      fileName: file.name,
      docType,
    });
  } catch (error: any) {
    console.error("POST /api/driver/upload error:", error.message);
    return NextResponse.json(
      { status: false, message: "Failed to upload document. Please try again." },
      { status: 500 }
    );
  }
}
