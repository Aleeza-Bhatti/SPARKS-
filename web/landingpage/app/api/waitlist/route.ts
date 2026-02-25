import { NextResponse } from "next/server";

import { storeWaitlistEntry } from "@/lib/waitlist-store";
import type { WaitlistSubmission } from "@/lib/types";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizePhone(phone: string) {
  return phone.replace(/[^\d+]/g, "").trim();
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<WaitlistSubmission>;

    const email = body.email?.trim().toLowerCase() || "";
    const phone = normalizePhone(body.phone || "");

    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: "Invalid email format." }, { status: 400 });
    }

    if (!phone || phone.length < 7) {
      return NextResponse.json({ message: "Phone is required." }, { status: 400 });
    }

    const payload: WaitlistSubmission = {
      email,
      phone,
      created_at: new Date().toISOString(),
    };

    await storeWaitlistEntry(payload);

    return NextResponse.json({ message: "You're officially on the Sparks waitlist." }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? "Could not save your signup. Please try again in a moment."
            : "Unexpected error.",
      },
      { status: 500 },
    );
  }
}
