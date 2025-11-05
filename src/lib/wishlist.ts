// Wishlist helper functions - Database version
import { toast } from "sonner";
import { supabase } from "./supabase";

export interface WishlistItem {
  id: string;
  customer_id: string;
  product_id: string;
  product_handle?: string;
  product_title: string;
  product_price: number;
  product_thumbnail?: string;
  created_at: string;
  updated_at: string;
}

// Get wishlist for current user from database
export const getWishlist = async (): Promise<WishlistItem[]> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    // Get customer_id from customer table
    const { data: customerData } = await supabase
      .from("customer")
      .select("id")
      .eq("email", user.email)
      .single();

    if (!customerData) return [];

    const { data, error } = await supabase
      .from("wishlist")
      .select("*")
      .eq("customer_id", customerData.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return [];
  }
};

// Add to wishlist in database
export const addToWishlist = async (item: {
  product_id: string;
  product_handle?: string;
  product_title: string;
  product_price: number;
  product_thumbnail?: string;
}): Promise<boolean> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to add to wishlist");
      return false;
    }

    // Get customer_id
    const { data: customerData } = await supabase
      .from("customer")
      .select("id")
      .eq("email", user.email)
      .single();

    if (!customerData) {
      toast.error("Customer profile not found");
      return false;
    }

    const { error } = await supabase.from("wishlist").insert({
      customer_id: customerData.id,
      product_id: item.product_id,
      product_handle: item.product_handle,
      product_title: item.product_title,
      product_price: item.product_price,
      product_thumbnail: item.product_thumbnail,
    });

    if (error) {
      if (error.code === "23505") {
        // Unique constraint violation
        toast.info("Already in wishlist");
        return false;
      }
      throw error;
    }

    toast.success("Added to wishlist! ❤️");
    return true;
  } catch (error: any) {
    console.error("Error adding to wishlist:", error);
    toast.error(error.message || "Failed to add to wishlist");
    return false;
  }
};

// Remove from wishlist
export const removeFromWishlist = async (
  productId: string
): Promise<boolean> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    // Get customer_id
    const { data: customerData } = await supabase
      .from("customer")
      .select("id")
      .eq("email", user.email)
      .single();

    if (!customerData) return false;

    const { error } = await supabase
      .from("wishlist")
      .delete()
      .eq("customer_id", customerData.id)
      .eq("product_id", productId);

    if (error) throw error;

    toast.success("Removed from wishlist");
    return true;
  } catch (error: any) {
    console.error("Error removing from wishlist:", error);
    toast.error(error.message || "Failed to remove from wishlist");
    return false;
  }
};

// Check if item is in wishlist
export const isInWishlist = async (productId: string): Promise<boolean> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: customerData } = await supabase
      .from("customer")
      .select("id")
      .eq("email", user.email)
      .single();

    if (!customerData) return false;

    const { data, error } = await supabase
      .from("wishlist")
      .select("id")
      .eq("customer_id", customerData.id)
      .eq("product_id", productId)
      .single();

    if (error && error.code !== "PGRST116") throw error; // Ignore "no rows" error
    return !!data;
  } catch (error) {
    console.error("Error checking wishlist:", error);
    return false;
  }
};

// Toggle wishlist
export const toggleWishlist = async (item: {
  product_id: string;
  product_handle?: string;
  product_title: string;
  product_price: number;
  product_thumbnail?: string;
}): Promise<boolean> => {
  const inWishlist = await isInWishlist(item.product_id);
  if (inWishlist) {
    return await removeFromWishlist(item.product_id);
  } else {
    return await addToWishlist(item);
  }
};
