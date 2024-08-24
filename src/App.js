// src/App.js
import React, { useState, useEffect } from 'react';
import { Layout, Menu, message } from 'antd';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';

import ProductList from './components/ProductList';
import Cart from './components/Cart';
import supabase from './supabaseClient'; // Import the Supabase client

const products = [
  { id: 1, name: 'Product A', price: 19.99, image_url: 'https://loremflickr.com/320/240/cat' },
  { id: 2, name: 'Product B', price: 29.99, image_url: 'https://loremflickr.com/320/240/dog' },
  { id: 3, name: 'Product C', price: 39.99, image_url: 'https://loremflickr.com/320/240/hen' },
  { id: 4, name: 'Product D', price: 49.99, image_url: 'https://loremflickr.com/320/240/cow' },
  { id: 5, name: 'Product E', price: 59.99, image_url: 'https://loremflickr.com/320/240/rabbit' },
  { id: 6, name: 'Product F', price: 69.99, image_url: 'https://loremflickr.com/320/240/lion' },
];
const { Header, Content, Footer } = Layout;

const App = () => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = async (product_id, quantity) => {
    try {

      // Check if the product is already in the cart
      const { data: existingItems, error: fetchError } = await supabase
        .from('cart')
        .select('*')
        .eq('product_id', product_id);

      if (fetchError) {
        throw fetchError;
      }

      if (existingItems.length > 0) {
        // Product exists, update the quantity
        const existingItem = existingItems[0];
        const newQuantity = quantity;

        const { data, error: updateError } = await supabase
          .from('cart')
          .update({ quantity: newQuantity })
          .eq('product_id', product_id);

        if (updateError) {
          throw updateError;
        }
        message.success('Updated Cart successfully');
      } else {
        // Product does not exist, insert a new item
        const { data, error: insertError } = await supabase
          .from('cart')
          .insert([{ product_id: product_id, quantity }]);

        if (insertError) {
          throw insertError;
        }
        message.success('Updated Cart successfully');
      }
    } catch (error) {
      console.error('Error adding to cart:', error.message);
      alert('Failed to add to cart. Please try again.');
    }
  };



  const removeFromCart = async (productId) => {
    const { error } = await supabase.from('cart').delete().eq('product_id', productId);

    if (error) {
      console.error('Error removing from cart:', error);
    } else {
      setCartItems(cartItems.filter((item) => item.product_id !== productId));
    }
  };

  const checkout = () => {
    // Handle checkout logic here
  };

  return (
    <Router>
      <Layout>
        <Header>
          <Menu theme="dark" mode="horizontal">
            <Menu.Item key="1">
              <Link to="/">Home</Link>
            </Menu.Item>
            <Menu.Item key="2">
              <Link to="/cart">Cart</Link>
            </Menu.Item>
          </Menu>
        </Header>
        <Content style={{ padding: '0 50px' }}>
          <Routes>
            <Route path="/" element={<ProductList products={products} addToCart={addToCart} />} />
            <Route path="/cart" element={<Cart products={products} cartItems={cartItems} removeFromCart={removeFromCart} checkout={checkout} />} />
          </Routes>
        </Content>
        <Footer style={{ textAlign: 'center' }}>Product Display App ©2024</Footer>
      </Layout>
    </Router>
  );
};

export default App;
