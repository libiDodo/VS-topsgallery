                                        /* Поиск по всем текстовым полям (регистронезависимый) */
// src/utils/tableSearching.js

/* Основная функция для поиска */
export const searchData = (data, query) => {                                //получаем таблицу и введённое значение
    if (!query) return data;                                                //если введённое значение пустое - возвращаем таблицу без изменений
    const lowerQuery = query.toLowerCase();                                 //приводим всё к нижнему регистру для упрощения поиска

    /* Фильтруем и возвращаем отфильтрованную таблицу */
    return data.filter(item => {

        /* Список полей для поиска */
        const fields = [
            item["К-во"],
            item.Название,
            item.Координаты,
            item.Описание,
            item.Авторы,
            item["Дата нахождения"]
        ];

        return fields.some(field =>
            field && field.toString().toLowerCase().includes(lowerQuery)    //выдаём только те строки, в которых были найдены совпадения с введённым значением
        );
    });
};