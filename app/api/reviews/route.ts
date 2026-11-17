import { NextResponse } from "next/server";
import { ReviewModel } from "@/models/Review";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const reviews = await ReviewModel.getApproved(limit);
    const summary = await ReviewModel.getRatingSummary();

    return NextResponse.json({
      status: true,
      reviews,
      summary,
    });
  } catch (error: any) {
    console.error("GET /api/reviews error:", error.message);
    return NextResponse.json({ status: false, message: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { authorName, comment, rating, route, quoteRef } = body;

    if (!authorName || !comment) {
      return NextResponse.json(
        { status: false, message: "Author name and comment are required." },
        { status: 400 }
      );
    }

    const review = await ReviewModel.create({
      authorName,
      comment,
      rating: rating || 5,
      route,
      quoteRef,
    });

    return NextResponse.json({
      status: true,
      review,
      message: "Thank you! Your review has been submitted.",
    });
  } catch (error: any) {
    console.error("POST /api/reviews error:", error.message);
    return NextResponse.json({ status: false, message: "Failed to submit review" }, { status: 500 });
  }
}
