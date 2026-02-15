import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

function authorize(request: NextRequest): boolean {
  const token = request.cookies.get("admin_token")?.value;
  return !!token && verifyAdminToken(token);
}

// GET: List all restaurants
export async function GET(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST: Create a new restaurant
export async function POST(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Validate required fields
    const required = [
      "name",
      "slug",
      "category",
      "rating",
      "review_text",
      "address",
      "latitude",
      "longitude",
    ];
    for (const field of required) {
      if (!body[field] && body[field] !== 0) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate category
    if (!["restaurant", "bubble_tea", "cafe"].includes(body.category)) {
      return NextResponse.json(
        { error: "Invalid category" },
        { status: 400 }
      );
    }

    // Validate rating
    if (body.rating < 1 || body.rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("restaurants")
      .insert({
        name: body.name,
        slug: body.slug,
        category: body.category,
        cuisine_type: body.cuisine_type || null,
        rating: body.rating,
        review_text: body.review_text,
        address: body.address,
        latitude: parseFloat(body.latitude),
        longitude: parseFloat(body.longitude),
        image_url: body.image_url || null,
        images: body.images || [],
        // Category ratings
        ambiance_rating: body.ambiance_rating || null,
        cleanliness_rating: body.cleanliness_rating || null,
        service_rating: body.service_rating || null,
        value_rating: body.value_rating || null,
        wait_time_rating: body.wait_time_rating || null,
        // Review sections
        menu_review: body.menu_review || null,
        vibe_review: body.vibe_review || null,
        location_review: body.location_review || null,
        tips: body.tips || null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "A restaurant with this slug already exists" },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Revalidate public pages
    revalidatePath("/");
    revalidatePath("/map");

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
