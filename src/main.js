/**
 * Функция для расчета выручки
 * @param purchase запись о покупке
 * @param _product карточка товара
 * @returns {number}
 */
function calculateSimpleRevenue(purchase, _product) {
   // @TODO: Расчет выручки от операциия
  //  const discount = 1 - purchase.discount / 100;
  // return (revenue = purchase.sale_price * purchase.quantity * discount);
  const {discount = 0, sale_price, quantity} = purchase;
  if (typeof sale_price !== 'number' || sale_price <= 0) {
        throw new Error('Некорректная цена продажи');
    }
    if (typeof quantity !== 'number' || quantity <= 0) {
        throw new Error('Некорректное количество');
    }
    const discountDecimal = discount / 100;
    const fullPrice = sale_price * quantity;
    const revenue = fullPrice * (1 - discountDecimal);
    return revenue;
}

/**
 * Функция для расчета бонусов
 * @param index порядковый номер в отсортированном массиве
 * @param total общее число продавцов
 * @param seller карточка продавца
 * @returns {number}
 */
function calculateBonusByProfit(index, total, seller) {
    // @TODO: Расчет бонуса от позиции в рейтинге
    const { profit } = seller || {};

     if (typeof profit !== 'number' || profit < 0) {
    throw new Error('Некорректное значение прибыли');
  }
  if (!Number.isInteger(index) || index < 0 || !Number.isInteger(total) || total < 0 || index >= total) {
    throw new Error('Некорректные аргументы ранжирования');
  }
  if (total === 0) {
    return 0;
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
 * @param data
 * @param options
 * @returns {{revenue, top_products, bonus, name, sales_count, profit, seller_id}[]}
 */
function analyzeSalesData(data, options) {
    // @TODO: Проверка входных данных
    if (!data || !options) {
        throw new Error('Не переданы входные данные');
    }

    // @TODO: Проверка наличия опций
    const {calculateRevenue, calculateBonus } = options;

    if (typeof calculateBonus !== 'function') {
        throw new Error('Не указана функция расчёта бонуса');
    }

    if (typeof calculateRevenue !== 'function') {
        throw new Error('Не указана функция расчёта выручки');
    }

    // if (typeof calculateBonus === 'function') {
    //     throw new Error('Не указана функция расчёта бонуса');
    // }

    // if (typeof calculateRevenue === 'function') {
    //     throw new Error('Не указана функция расчёта выручки');
    // }

    // @TODO: Подготовка промежуточных данных для сбора статистики
    // const sellersIndex = new Map();
    // const productsIndex = new Map();

    const sellerIndex = data.sellers.reduce((index, seller) => {
        return {
            ...index,
            [seller.id]: {
                id: seller.id,
                name: `${seller.first_name} ${seller.last_name}`,
                revenue: 0,
                profit: 0,
                sales_count: 0,
                products_sold: {}
            }
        };
    }, {});

    const productIndex = Object.fromEntries(data.products.map(product => [
        product.sku, 
        product
    ]));

    // let totalSales = 0;
    // let totalRevenue = 0;
    // let totalProfit = 0;

    // data.sales.forEach(sale => {
    //     const sellerId = sale.seller_id;
    //     const productId = sale.product_id;

        if (!sellerIndex.has(sellerId)) {
            throw new Error(`Не найден продавец с ID: ${sellerId}`);
        }

    //     const sellerStat = sellersIndex.get(sellerId);

    // @TODO: Индексация продавцов и товаров для быстрого доступа

    // @TODO: Расчет выручки и прибыли для каждого продавца

    // @TODO: Сортировка продавцов по прибыли

    // @TODO: Назначение премий на основе ранжирования

    // @TODO: Подготовка итоговой коллекции с нужными полями
}
