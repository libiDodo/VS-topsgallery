                                        /* Сортировка строк сверху вниз*/
// src/utils/tablesorting.js

/* Порядок цветов */
const colorOrder = [
    '7030A0', // фиолетовый
    'FFC000', // оранжевый
    'C00000', // багровый
    'FF5050', // красный
    'F0C2DB'  // розовый
];

/* Функция сравнения двух обычных строк (не подзаголовков) */
const compareRows = (a, b) => {
    /* Сортировка по цвету (приводим к верхнему регистру для надёжности) */
    const colorA = a.color ? a.color.toUpperCase() : '';
    const colorB = b.color ? b.color.toUpperCase() : '';
    const colorIndexA = colorOrder.indexOf(colorA);
    const colorIndexB = colorOrder.indexOf(colorB);
    /* Если значение не найдено – отправляем в конец */
    const colorOrderA = colorIndexA === -1 ? colorOrder.length : colorIndexA;
    const colorOrderB = colorIndexB === -1 ? colorOrder.length : colorIndexB;
    return colorOrderA - colorOrderB;
};

/* Основная функция сортировки с учётом подзаголовков */
export const sortData = (data) => {
    const result = [];
    let currentGroup = [];

    for (const item of data) {
        if (item.isHeader !== null) {                                   // Если isHeader !== null – это подзаголовок
            if (currentGroup.length > 0) {                              // Сначала сортируем накопленную группу и добавляем её
                currentGroup.sort(compareRows);
                result.push(...currentGroup);
                currentGroup = [];
            }
            result.push(item);                                          // Добавляем сам подзаголовок
        } else {
            currentGroup.push(item);                                    // Обычная строка – добавляем в текущую группу
        }
    }
    if (currentGroup.length > 0) {                                      // Добавляем последнюю группу, если она есть
        currentGroup.sort(compareRows);
        result.push(...currentGroup);
    }
    return result;
};