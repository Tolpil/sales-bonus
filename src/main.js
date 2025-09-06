/**
 * Функция для расчета выручки
 * @param purchase запись о покупке
 * @param _product карточка товара
 * @returns {number}
 */
function calculateSimpleRevenue(purchase, _product) {
   // @TODO: Расчет выручки от операции
   const discont = 1 - purchase.discont / 100;
   return (revenue = purchase.sale_price * purchase.quantity * discont);
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
    const {profit} = seller;
    if (typeof profit !== 'number' || profit < 0) {
      throw new Error('Не корректное значение прибыли');
    }

    let bonusPercent = 0;

    if (total === 0) {
      return 0;
    }

    if (index === 0) {
      bonusPercent = 0.15;
    } else if (index === 1 || index === 2) {
      bonusPercent = 0.10;
    } else if (index < total -1) {
      bonusPercent = 0.05;
    } //else {
    //   bonusPercent = 0;
    // }
    // return bonusPercent;

    return profit * bonusPercent;
  }


/**
 * Функция для анализа данных продаж
 * @param data
 * @param options
 * @returns {{revenue, top_products, bonus, name, sales_count, profit, seller_id}[]}
 */
function analyzeSalesData(data, options) {
    // @TODO: Проверка входных данных

    // @TODO: Проверка наличия опций

    // @TODO: Подготовка промежуточных данных для сбора статистики

    // @TODO: Индексация продавцов и товаров для быстрого доступа

    // @TODO: Расчет выручки и прибыли для каждого продавца

    // @TODO: Сортировка продавцов по прибыли

    // @TODO: Назначение премий на основе ранжирования

    // @TODO: Подготовка итоговой коллекции с нужными полями
}
