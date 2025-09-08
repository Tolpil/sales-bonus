/**
 * Функция для расчета выручки
 * @param purchase запись о покупке
 * @param _product карточка товара
 * @returns {number}
 */
function calculateSimpleRevenue(purchase, _product) {
   // @TODO: Расчет выручки от операции
   const { discount = 0, sale_price, quantity } = purchase;

    if (typeof sale_price !== "number" || sale_price <= 0) {
        throw new Error("Некорректная цена продажи");
    }
    if (typeof quantity !== "number" || quantity <= 0) {
        throw new Error("Некорректное количество");
    }
    if (typeof discount !== "number" || discount < 0 || discount > 100) {
        throw new Error("Некорректный процент скидки");
    }

    const discountDecimal = 1 - discount / 100;
    const revenue = sale_price * quantity * discountDecimal;

    if (revenue < 0) {
        throw new Error("Ошибка расчета выручки: отрицательное значение");
    }

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

    if (typeof profit !== "number" || profit < 0) {
        throw new Error("Некорректное значение прибыли");
    }
    if (!Number.isInteger(index) || index < 0 || !Number.isInteger(total) || total < 0 || index >= total) {
        throw new Error("Некорректные аргументы ранжирования");
    }
    if (total === 0) {
        return 0;
    }

    if (index === 0) {
        return profit * 0.15;
    } else if (index === 1 || index === 2) {
        return profit * 0.1;
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
        throw new Error("Не переданы входные данные");
    }
    // @TODO: Проверка наличия опций
     const { calculateRevenue, calculateBonus } = options;

    if (typeof calculateRevenue !== "function") {
        throw new Error("Не указана функция расчёта выручки");
    }
    if (typeof calculateBonus !== "function") {
        throw new Error("Не указана функция расчёта бонуса");
    }
    

    // @TODO: Индексация продавцов и товаров для быстрого доступа
    const sellerIndex = data.sellers.reduce((index, seller) => {
        return {
            ...index,
            [seller.id]: {
                id: seller.id,
                name: `${seller.first_name} ${seller.last_name}`,
                revenue: 0,
                profit: 0,
                sales_count: 0,
                products_sold: {},
            },
        };
    }, {});

    const productIndex = Object.fromEntries(data.products.map((product) => [product.sku, product]));

    // @TODO: Подготовка промежуточных данных для сбора статистики
    data.purchase_records.forEach((record) => {
        if (!record.items || !Array.isArray(record.items)) {
            throw new Error("Некорректные данные в чеке");
        }

        record.items.forEach((item) => {
            if (!item.sku || !item.quantity || !item.sale_price) {
                throw new Error("Неполные данные о товаре в чеке");
            }
        });
    });

    Object.values(productIndex).forEach((product) => {
        if (!product.purchase_price) {
            throw new Error("Отсутствует закупочная цена товара");
        }
    });
    
    // @TODO: Расчет выручки и прибыли для каждого продавца
    let totalSales = 0;
    let totalRevenue = 0;
    let totalProfit = 0;

    data.purchase_records.forEach((record) => {
        const seller = sellerIndex[record.seller_id];

        if (!seller) {
            throw new Error(`Не найден продавец с ID: ${record.seller_id}`);
        }

        // Обновляем количество продаж
        seller.sales_count++;
        totalSales++;

        let checkRevenue = 0;
        let checkProfit = 0;

        record.items.forEach((item) => {
            const product = productIndex[item.sku];

            if (!product) {
                throw new Error(`Не найден товар с SKU: ${item.sku}`);
            }

            // Рассчитываем выручку
            const revenue = calculateRevenue(item, product);
            checkRevenue += revenue;

            // Рассчитываем себестоимость
            const cost = product.purchase_price * item.quantity;

            // Рассчитываем прибыль
            const profit = revenue - cost;
            checkProfit += profit;

            // Обновляем статистику по товарам
            if (!seller.products_sold[item.sku]) {
                seller.products_sold[item.sku] = 0;
            }
            seller.products_sold[item.sku] += item.quantity;
        });

        // Обновляем статистику продавца
        seller.revenue += checkRevenue;
        seller.profit += checkProfit;
        totalRevenue += checkRevenue;
        totalProfit += checkProfit;
    });

    // @TODO: Сортировка продавцов по прибыли
    const sortedSellers = Object.values(sellerIndex).sort((a, b) => b.profit - a.profit);
    
    // @TODO: Назначение премий на основе ранжирования
    sortedSellers.forEach((seller, index) => {
        // Рассчитываем бонус
        seller.bonus = calculateBonus(index, sortedSellers.length, seller);

        // Формируем топ-10 товаров
        seller.top_products = Object.entries(seller.products_sold)
            .map(([sku, quantity]) => ({
                sku: sku,
                quantity: quantity,
                product_name: productIndex[sku].name,
            }))
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 10);
    });

    // @TODO: Подготовка итоговой коллекции с нужными полями
    return sortedSellers.map((seller) => ({
        seller_id: seller.id,
        name: seller.name,
        revenue: +seller.revenue.toFixed(2),
        profit: +seller.profit.toFixed(2),
        sales_count: seller.sales_count,
        top_products: seller.top_products,
        bonus: +seller.bonus.toFixed(2),
    }));
}
