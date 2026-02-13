import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

function authorize(request: NextRequest): boolean {
    const token = request.cookies.get("admin_token")?.value;
    return !!token && verifyAdminToken(token);
}

// GET: List dishes (optional ?restaurant_id= filter)
export async function GET(request: NextRequest) {
    if (!authorize(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get("restaurant_id");

    const supabase = createAdminClient();
    let query = supabase
        .from("dishes")
        .select("*, restaurants(name, slug)")
        .order("created_at", { ascending: false });

    if (restaurantId) {
        query = query.eq("restaurant_id", restaurantId);
    }

    const { data, error } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

// POST: Create a new dish review
export async function POST(request: NextRequest) {
    if (!authorize(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();

        // Validate required fields
        const required = [
            "restaurant_id",
            "name",
            "review_text",
            "food_rating",
            "service_rating",
            "price_rating",
        ];
        for (const field of required) {
            if (!body[field] && body[field] !== 0) {
                return NextResponse.json(
                    { error: `Missing required field: ${field}` },
                    { status: 400 }
                );
            }
        }

        // Validate ratings
        for (const field of ["food_rating", "service_rating", "price_rating"]) {
            if (body[field] < 1 || body[field] > 5) {
                return NextResponse.json(
                    { error: `${field} must be between 1 and 5` },
                    { status: 400 }
                );
            }
        }

        const supabase = createAdminClient();

        // Verify restaurant exists
        const { data: restaurant } = await supabase
            .from("restaurants")
            .select("slug")
            .eq("id", body.restaurant_id)
            .single();

        if (!restaurant) {
            return NextResponse.json(
                { error: "Restaurant not found" },
                { status: 404 }
            );
        }

        const { data, error } = await supabase
            .from("dishes")
            .insert({
                restaurant_id: body.restaurant_id,
                name: body.name,
                review_text: body.review_text,
                food_rating: body.food_rating,
                service_rating: body.service_rating,
                price_rating: body.price_rating,
                images: body.images || [],
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Revalidate the restaurant page
        revalidatePath(`/restaurant/${restaurant.slug}`);

        return NextResponse.json(data, { status: 201 });
    } catch {
        return NextResponse.json(
            { error: "Invalid request body" },
            { status: 400 }
        );
    }
}
