import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, password } = body;

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { status: 400, errorMessage: "Please fill in all required fields." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      status: 200,
      user: {
        id: "usr_" + Math.random().toString(36).substring(2, 8),
        name: `${firstName} ${lastName}`,
        email,
        phone,
      },
      message: "Account created successfully.",
    });
  } catch (error) {
    return NextResponse.json(
      { status: 500, errorMessage: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
