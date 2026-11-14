import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ status: 400, message: "Email and password are required" }, { status: 400 });
    }

    // Authenticate user (demo accepts any valid format or registered credentials)
    return NextResponse.json({
      status: 200,
      user: {
        id: "usr_1",
        email,
        name: email.split("@")[0],
      },
    });
  } catch (error) {
    return NextResponse.json({ status: 500, message: "Login failed" }, { status: 500 });
  }
}
