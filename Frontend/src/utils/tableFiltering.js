                                        /* Функция фильтрации по цвету и символу города */
// src/utils/tableFiltering.js

/* Конфигурация цветов */
export const colorFilters = [
    { name: 'Постройка разработчиков', hex: '7030A0' },
    { name: 'Одна из лучших', hex: 'FFC000' },
    { name: 'Очень красивая', hex: 'C00000' },
    { name: 'Красивая', hex: 'FF5050' },
    { name: 'Средняя', hex: 'F0C2DB' }
];

/* Специальный символ */
export const SPECIAL_SYMBOL = {name: 'Город',  value: '✧'};

/* Функция, проверяющая, проходит ли элемент через фильтры */
const passesFilter = (item, selectedColors, showSpecial) => {               //передаем функции данные таблицы, массив выбранных цветов и значение чекбокса "Город"
    if (item.isHeader !== null) return true;                                //подзаголовки всегда показываем

    /* Фильтр по цвету */
    if (item.color) {                                                       //если у строки есть цвет...
        const colorHex = item.color.toUpperCase();                          //приводим его к верхнему регистру для стабильности и записываем его в переменную
        if (!selectedColors.has(colorHex)) return false;                    //если цвета нету в списке выбранных цветов, удаляем строку из таблицы
    }

    /* Фильтр по спецсимволу */
    const quality = item["К-во"];                                           //проверяем столбец "К-во"
    if (quality === SPECIAL_SYMBOL.value) {                                       //если в ячейке есть символ города
        return showSpecial;                                                 //сохраняем/удаляем строку в зависимости от значения чекбокса
    }

  return true;                                                              //в иных случаях сохраняем строку
};

/* Функция фильтра */
export const filterData = (data, selectedColors, showSpecial) => {
    return data.filter(item => passesFilter(item, selectedColors, showSpecial));    //фильтруем полученную таблицу data с помощью метода filter с условием passesFilter
};