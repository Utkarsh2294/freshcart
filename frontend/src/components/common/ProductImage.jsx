import { getProductImage } from "../../utils/productImages";

export default function ProductImage({ product, ...props }) {
  return (
    <img
      {...props}
      src={getProductImage(product)}
      alt={product?.name || "Product"}
      loading="lazy"
      decoding="async"
      onError={(event) => {
        event.currentTarget.onerror = null;
        event.currentTarget.src = getProductImage({
          ...product,
          imageUrl: "",
          image_url: "",
        });
      }}
    />
  );
}
