'use client';

import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addToCart } from '@/app/redux/slices/cartSlice';
import ProductDetails from '@/components/ProductDetails';
import RecentlyViewed from '@/components/RecentlyViewed';

export default function ProductDetailsWrapper({ product }) {
  const dispatch = useDispatch();

  // Default color: first variant’s color
  const [selectedColor, setSelectedColor] = useState(
    product.variants[0]?.color || ''
  );
  const [selectedSize, setSelectedSize] = useState('');

  // Sizes update when color changes
  const availableSizesForColor =
    product.variants.find((v) => v.color === selectedColor)?.sizes || [];

  // Reset size when color changes
  useEffect(() => {
    setSelectedSize('');
  }, [selectedColor]);

  // Add to cart using Redux
  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please select a size.');
      return;
    }

    dispatch(
      addToCart({
        id: `${product.id}-${selectedColor}-${selectedSize}`,
        title: product.name,
        price: product.price,
        color: selectedColor,
        size: selectedSize,
        imageUrl: product.imageUrl,
      })
    );
  };

  return (
    <>
      <ProductDetails
        product={product}
        selectedColor={selectedColor}
        selectedSize={selectedSize}
        onColorSelect={setSelectedColor}
        onSizeSelect={setSelectedSize}
        onAddToCart={handleAddToCart}
        availableSizesForColor={availableSizesForColor}
      />
      <RecentlyViewed />
    </>
  );
}
