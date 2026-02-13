import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

function authorize(request: NextRequest): boolean {
    const token = request.cookies.get("admin_token")?.value;
    return !!token && verifyAdminToken(token);
}

// GET: Fetch a single dish by ID
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
        .from("dishes")
        .select("*, restaurants(name, slug)")
        .eq("id", id)
        .single();

    if (error || !data) {
        return NextResponse.json({ error: "Dish not found" }, { status: 404 });
    }

    return NextResponse.json(data);
}

// PATCH: Update a dish
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

        // Validate ratings if provided
        for (const field of ["food_rating", "service_rating", "price_rating"]) {
            if (body[field] !== undefined && (body[field] < 1 || body[field] > 5)) {
                return NextResponse.json(
                    { error: `${field} must be between 1 and 5` },
                    { status: 400 }
                );
            }
        }

        const supabase = createAdminClient();

        const updateFields: Record<string, unknown> = {};
        const allowedFields = [
            "name",
            "review_text",
            "food_rating",
            "service_rating",
            "price_rating",
            "images",
        ];

        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updateFields[field] = body[field];
            }
        }

        const { data, error } = await supabase
            .from("dishes")
            .update(updateFields)
            .eq("id", id)
            .select("*, restaurants(name, slug)")
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Revalidate the restaurant page
        const restaurantData = data?.restaurants as { slug?: string } | null;
        if (restaurantData?.slug) {
            revalidatePath(`/restaurant/${restaurantData.slug}`);
        }

        return NextResponse.json(data);
    } catch {
        return NextResponse.json(
            { error: "Invalid request body" },
            { status: 400 }
        );
    }
}

// DELETE: Remove a dish
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!authorize(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const supabase = createAdminClient();

    // Get the dish first to clean up its images
    const { data: dish } = await supabase
        .from("dishes")
        .select("images, restaurants(slug)")
        .eq("id", id)
        .single();

    if (!dish) {
        return NextResponse.json({ error: "Dish not found" }, { status: 404 });
    }

    // Delete images from storage
    const images = (dish.images as string[]) || [];
    if (images.length > 0) {
        await supabase.storage.from("restaurant-images").remove(images);
    }

    // Delete the dish row
    const { error } = await supabase.from("dishes").delete().eq("id", id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Revalidate the restaurant page
    const restaurantData = dish.restaurants as { slug?: string } | null;
    if (restaurantData?.slug) {
        revalidatePath(`/restaurant/${restaurantData.slug}`);
    }

    return NextResponse.json({ success: true });
}
