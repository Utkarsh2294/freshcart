export function applyOptimisticSwap(items, itemId, option) {
  return items.map((item) => {
    if (String(item._id || item.id) !== String(itemId)) return item;

    return {
      ...item,
      product_id: option.id,
      productId: option.id,
      name: option.name,
      price: Number(option.price),
      mrp: Number(option.mrp || option.price),
      unit: option.unit,
      image_url: option.imageUrl || option.image_url,
      imageUrl: option.imageUrl || option.image_url,
      category: option.category,
      brand: option.brand,
      product: option,
    };
  });
}

export function cartTotal(items) {
  return items.reduce(
    (sum, item) => sum + Number(item.price || item.product?.price || 0) * Number(item.quantity || item.qty || 0),
    0,
  );
}
