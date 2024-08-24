import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Spin, message } from 'antd';
import supabase from '../supabaseClient';

const { Meta } = Card;


const ProductList = ({ addToCart, cart = [], products }) => {
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    const fetchProductsAndCart = async () => {
      try {
        // Initialize quantities with 0 for each product
        const initialQuantities = {};
        products.forEach(product => {
          initialQuantities[product.id] = 0;
        });
        const { data: cartData, error: cartError } = await supabase
          .from('cart')
          .select('*');

        if (cartError) {
          throw cartError;
        }

        // Populate quantities with existing cart data
        cartData.forEach(cartItem => {
          if (initialQuantities[cartItem.product_id] !== undefined) {
            initialQuantities[cartItem.product_id] = cartItem.quantity;
          }
        });

        setQuantities(initialQuantities);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchProductsAndCart();


  }, [products]);

  const handleIncrease = (productId) => {
    setQuantities(prevQuantities => ({
      ...prevQuantities,
      [productId]: prevQuantities[productId] + 1,
    }));
  };

  const handleDecrease = (productId) => {
    setQuantities(prevQuantities => ({
      ...prevQuantities,
      [productId]: Math.max(prevQuantities[productId] - 1, 0),
    }));
  };

  const handleAddToCart = async (productId) => {
    const quantity = quantities[productId];

    if (quantity > 0) {
      addToCart(productId, quantity);
    } else {
      message.warning('Please select a quantity before adding to the cart.');
    }
  };


  if (loading) return <Spin />;

  return (
    <Row gutter={[16, 16]}>
      {products.length === 0 ? (
        <Col span={24}>
          <p>No products available</p>
        </Col>
      ) : (
        products.map((product) => (
          <Col span={8} key={product.id}>
            <Card
              cover={
                <img
                  alt={product.name}
                  src={product.image_url}
                  onError={(e) => {
                    e.target.src = 'https://loremflickr.com/320/240/cat';
                  }}
                />
              }
              actions={[
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Button
                    onClick={() => handleDecrease(product.id)}
                    disabled={quantities[product.id] === 0}
                  >
                    -
                  </Button>
                  <span style={{ margin: '0 10px' }}>
                    {quantities[product.id]}
                  </span>
                  <Button onClick={() => handleIncrease(product.id)}>
                    +
                  </Button>
                </div>,
                <Button onClick={() => handleAddToCart(product.id)}>
                  Add to Cart
                </Button>
              ]}
            >
              <Meta title={product.name} description={`$${product.price}`} />
            </Card>
          </Col>
        ))
      )}
    </Row>
  );
};

export default ProductList;
