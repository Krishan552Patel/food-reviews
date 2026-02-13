import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

function authorize(request: NextRequest): boolean {
  const token = request.cookies.get("admin_token")?.value;
  return !!token && verifyAdminToken(token);
}

// GET: Fetch a single restaurant by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Restaurant not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}

// PATCH: Update a restaurant
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    // Validate category if provided
    if (
      body.category &&
      !["restaurant", "bubble_tea", "cafe"].includes(body.category)
    ) {
      return NextResponse.json(
        { error: "Invalid category" },
        { status: 400 }
      );
    }

    // Validate rating if provided
    if (body.rating && (body.rating < 1 || body.rating > 5)) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Get the old data first (for slug-based revalidation)
    const { data: oldData } = await supabase
      .from("restaurants")
      .select("slug")
      .eq("id", id)
      .single();

    const updateFields: Record<string, unknown> = {};
    const allowedFields = [
      "name",
      "slug",
      "category",
      "cuisine_type",
      "rating",
      "review_text",
      "address",
      "latitude",
      "longitude",
      "image_url",
      "ambiance_rating",
      "cleanliness_rating",
      "service_rating",
      "value_rating",
      "wait_time_rating",
      "menu_review",
      "vibe_review",
      "location_review",
      "tips",
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateFields[field] = body[field];
      }
    }

    if (updateFields.latitude)
      updateFields.latitude = parseFloat(updateFields.latitude as string);
    if (updateFields.longitude)
      updateFields.longitude = parseFloat(updateFields.longitude as string);

    const { data, error } = await supabase
      .from("restaurants")
      .update(updateFields)
      .eq("id", id)
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
    if (oldData?.slug) {
      revalidatePath(`/restaurant/${oldData.slug}`);
    }
    if (data?.slug && data.slug !== oldData?.slug) {
      revalidatePath(`/restaurant/${data.slug}`);
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

// DELETE: Remove a restaurant
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createAdminClient();

  // Get the restaurant first to clean up its image
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("slug, image_url")
    .eq("id", id)
    .single();

  if (!restaurant) {
    return NextResponse.json(
      { error: "Restaurant not found" },
      { status: 404 }
    );
  }

  // Delete the image from storage if it exists
  if (restaurant.image_url) {
    await supabase.storage
      .from("restaurant-images")
      .remove([restaurant.image_url]);
  }

  // Delete the restaurant row
  const { error } = await supabase
    .from("restaurants")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Revalidate public pages
  revalidatePath("/");
  revalidatePath("/map");
  revalidatePath(`/restaurant/${restaurant.slug}`);

  return NextResponse.json({ success: true });
}
