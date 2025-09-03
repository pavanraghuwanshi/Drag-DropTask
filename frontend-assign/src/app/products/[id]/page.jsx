import { fetchProductById } from '@/data/products';
import { notFound } from 'next/navigation';
import ProductDetailsWrapper from './ProductDetailsWrapper';

export default async function ProductPage({ params }) {
  const { id } = await params;
  const product = await fetchProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="p-8 bg-white rounded-lg shadow-xl">
      <ProductDetailsWrapper product={product} />
    </div>
  );
}
