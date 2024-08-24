import React, { useState, useEffect } from 'react';
import { List, Button, Typography, Spin, message } from 'antd';
import supabase from '../supabaseClient';

const { Title } = Typography;

const Cart = ({products}) => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        // Fetch only the cart items from Supabase
        const { data: cartData, error: cartError } = await supabase
          .from('cart')
          .select('id, product_id, quantity');

        if (cartError) {
          throw cartError;
        }

        // Map through the cart data and match product details using the products prop
        const cartItemsWithDetails = cartData.map(cartItem => {
          const product = products.find(p => p.id === cartItem.product_id);

          return {
            cart_id: cartItem.id,
            product_id: product.id,
            name: product.name,
            price: product.price,
            quantity: cartItem.quantity,
          };
        });

        setCartItems(cartItemsWithDetails);

        // Calculate the total price
        const totalPrice = cartItemsWithDetails.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        setTotal(totalPrice);

      } catch (error) {
        console.error('Error fetching cart items:', error);
      } finally {
        setLoading(false);
      }
    };


    fetchCartItems();
  }, [products]);

  const removeFromCart = async (cartId) => {
    try {
      // Delete the item from the cart table in Supabase
      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('id', cartId);

      if (error) {
        throw error;
      }

      // Remove the item from the local state
      setCartItems(prevItems => prevItems.filter(item => item.cart_id !== cartId));

      // Recalculate the total price
      const updatedTotal = cartItems.reduce(
        (sum, item) => sum + (item.cart_id !== cartId ? item.price * item.quantity : 0),
        0
      );
      setTotal(updatedTotal);

    } catch (error) {
      console.error('Error removing item from cart:', error);
    }
  };

  const handleCheckout = async () => {
    try {
      // Delete all items from the cart table in Supabase
      const { error } = await supabase
        .from('cart')
        .delete()
        .gt('id', 0); // This ensures that all rows with an id greater than 0 are deleted

      if (error) {
        throw error;
      }

      // Clear the local state
      setCartItems([]);
      setTotal(0);

      // Display success message
      message.success('Order placed successfully');
    } catch (error) {
      console.error('Error during checkout:', error);
      message.error('Failed to place the order. Please try again.');
    }
  };

  if (loading) return <Spin />; // Display a loading spinner while data is being processed

  return (
    <div>
      <Title level={2}>Cart</Title>
      {cartItems.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <List
          bordered
          dataSource={cartItems}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button onClick={() => removeFromCart(item.cart_id)}>Remove</Button>
              ]}
            >
              {item.name} - ${item.price.toFixed(2)} x {item.quantity}
            </List.Item>
          )}
        />
      )}
      <Title level={3}>Total: ${total.toFixed(2)}</Title>
      {cartItems.length > 0 && (
        <Button type="primary" onClick={handleCheckout}>
          Checkout
        </Button>
      )}
    </div>
  );
};

export default Cart;
