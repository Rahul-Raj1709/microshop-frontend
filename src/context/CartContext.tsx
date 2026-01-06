import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { getClientId } from "../lib/clientId";

type CartContextType = {
  cartCount: number;
  refreshCart: () => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartCount, setCartCount] = useState(0);
  const { user, getToken, API_URL } = useAuth();

  const refreshCart = async () => {
    // If not logged in, count is 0
    if (!user) {
      setCartCount(0);
      return;
    }

    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
          ClientId: getClientId(), // <--- Add this
        },
      });

      if (res.ok) {
        const data = await res.json();
        // Sum total quantity
        const total = data.reduce(
          (acc: number, item: any) => acc + item.quantity,
          0
        );
        setCartCount(total);
      }
    } catch (err) {
      console.error("Failed to fetch cart count", err);
    }
  };

  // Auto-refresh when user logs in
  useEffect(() => {
    refreshCart();
  }, [user]);

  return (
    <CartContext.Provider value={{ cartCount, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
