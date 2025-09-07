/*
 * Функция для расчета выручки
 * @param purchase запись о покупке
 * @param _product карточка товара
 * @returns {number}
 */
function calculateSimpleRevenue(purchase, _product) {
  const sale_price = Number(purchase?.sale_price);
  const quantity = Number(purchase?.quantity);
  const discountPct = Number(purchase?.discount ?? purchase?.discont ?? 0);

  if (!Number.isFinite(sale_price) || sale_price <= 0) {
    throw new Error('Некорректная цена продажи');
  }
  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new Error('Некорректное количество');
  }

  const discountFactor = 1 - (Number.isFinite(discountPct) ? discountPct : 0) / 100;
  const revenue = sale_price * quantity * discountFactor;

  if (!Number.isFinite(revenue) || revenue < 0) {
    throw new Error('Ошибка расчета выручки');
  }
  return revenue;
}

/*
 * Функция для расчета бонусов
 * @param index порядковый номер в отсортированном массиве
 * @param total общее число продавцов
 * @param seller карточка продавца
 * @returns {number}
 */
function calculateBonusByProfit(index, total, seller) {
  const { profit } = seller || {};

  if (typeof profit !== 'number' || profit < 0) {
    throw new Error('Некорректное значение прибыли');
  }
  if (
    !Number.isInteger(index) || index < 0 ||
    !Number.isInteger(total) || total <= 0 ||
    index >= total
  ) {
    throw new Error('Некорректные аргументы ранжирования');
  }

  if (index === 0) {
    return profit * 0.15;
  } else if (index === 1 || index === 2) {
    return profit * 0.10;
  } else if (index === total - 1) {
    return 0;
  } else {
    return profit * 0.05;
  }
}

/**
 * Функция для анализа данных продаж
 * @param data { sellers, products, purchase_records }
 * @param options { calculateRevenue, calculateBonus }
 * @returns {{revenue, top_products, bonus, name, sales_count, profit, seller_id}[]}
 */
function analyzeSalesData(data, options) {
  if (!data || !options) {
    throw new Error('Не переданы входные данные');
  }
  const { calculateRevenue, calculateBonus } = options;
  if (typeof calculateRevenue !== 'function') {
    throw new Error('Не указана функция расчёта выручки');
  }
  if (typeof calculateBonus !== 'function') {
    throw new Error('Не указана функция расчёта бонуса');
  }
  if (!Array.isArray(data.sellers) || !Array.isArray(data.products) || !Array.isArray(data.purchase_records)) {
    throw new Error('Некорректная структура входных данных');
  }

  const productIndex = Object.fromEntries(
    data.products.map(product => [product.sku, product])
  );

  const sellerIndex = data.sellers.reduce((index, seller) => {
    index[seller.id] = {
      id: seller.id,
      name: `${seller.first_name ?? ''} ${seller.last_name ?? ''}`.trim(),
      revenue: 0,
      profit: 0,
      sales_count: 0,
      products_sold: {}
    };
    return index;
  }, {});

  for (const record of data.purchase_records) {
    const seller = sellerIndex[record.seller_id];
    if (!seller) {
      throw new Error(`Не найден продавец с ID: ${record.seller_id}`);
    }
    if (!record.items || !Array.isArray(record.items)) {
      throw new Error('Некорректные данные в чеке');
    }

    seller.sales_count += 1;

    for (const item of record.items) {
      if (!item?.sku || !Number.isFinite(Number(item.quantity)) || !Number.isFinite(Number(item.sale_price))) {
        throw new Error('Неполные данные о товаре в чеке');
      }

      const product = productIndex[item.sku];
      if (!product) {
        throw new Error(`Не найден товар с SKU: ${item.sku}`);
      }
      if (!Number.isFinite(Number(product.purchase_price))) {
        throw new Error('Отсутствует закупочная цена товара');
      }

      let revenue = 0;
      try {
        revenue = Number(calculateRevenue(item, product));
      } catch (e) {throw new Error(`Ошибка расчёта выручки по SKU ${item.sku}: ${e.message}`);
      }
      if (!Number.isFinite(revenue) || revenue < 0) {
        throw new Error(`Ошибка расчёта выручки по SKU ${item.sku}`);
      }

      const qty = Number(item.quantity);
      const cost = Number(product.purchase_price) * qty;
      const profit = revenue - cost;

      seller.revenue += revenue;
      seller.profit += profit;

      seller.products_sold[item.sku] = (seller.products_sold[item.sku] ?? 0) + qty;
    }
  }

  const sortedSellers = Object.values(sellerIndex).sort((a, b) => b.profit - a.profit);

  sortedSellers.forEach((seller, index) => {
    seller.bonus = Number(calculateBonus(index, sortedSellers.length, seller)) || 0;
    seller.top_products = Object.entries(seller.products_sold)
      .map(([sku, quantity]) => ({
        sku,
        quantity,
        product_name: productIndex[sku]?.name
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
  });

  return sortedSellers.map(seller => ({
    seller_id: seller.id,
    name: seller.name,
    revenue: +seller.revenue.toFixed(2),
    profit: +seller.profit.toFixed(2),
    sales_count: seller.sales_count,
    top_products: seller.top_products,
    bonus: +seller.bonus.toFixed(2)
  }));
}