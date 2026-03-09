                                        /* Основной код приложения */
// src/App.js


/* Импортируем сторонние модули */
import React, { useState, useEffect, useMemo, useCallback } from 'react';                        //подключаем хуки React

import { colorFilters, SPECIAL_SYMBOL, filterData } from './utils/tableFiltering';  //кастомная модуль для фильтрации по цвету
import { sortData } from './utils/tablesorting';                                    //кастомный модуль для автоматической сортировки таблицы
import { searchData } from './utils/tableSearching';                                //кастомный модуль для поиска в таблице
import { HighlightText } from './utils/highlight';                                  //кастомный модуль для выделения текста

import './App.css';                                                                 //общая таблица стилей для приложения


/* Начало компонента */
function App() {

    /* Задаём переменные состояния для загрузки данных */
    const [topsJSON, setTops] = useState([]);       //переменная, содержащая таблицу TOPS. По умолчанию пустое.
    const [galleries, setGalleries] = useState({}); //переменная, содержащая таблицу ссылок на изображения. По умолчанию пустое.
    const [loading, setLoading] = useState(true);   //переменная состояния загрузки. По умолчанию загрузка активна.
    const [error, setError] = useState(null);       //переменная состояния ошибки. По умолчанию ошибок нет.

    /* Получаем данные от сервера */
    useEffect(() => {
        Promise.all([       //отправляем запрос серверу на получение данных
            fetch('/api/tops').then(res => {        //получаем tops.json
                if (!res.ok) throw new Error('Ошибка загрузки tops.json');
                return res.json();
            }),
            fetch('/api/gallery').then(res => {     //получаем gallery.json
                if (!res.ok) throw new Error('Ошибка загрузки gallery.json');
                return res.json();
            })
        ])      //когда оба ответа даны, идём дальше
        .then(([topsData, galleryData]) => {        //присваивыем переменным полученные значения
            setTops(topsData);
            setGalleries(galleryData);
            setLoading(false);      //загрузка окончена
        })
        .catch(err => {     //обработчик ошибок
            setError(err.message);
            setLoading(false);
        });
    }, []);

/*////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/

    /* Функция получения имён файлов */
    const getFileNameFromUrl = (url) => {
        try {
            // Удаляем query-параметры (после ?)
            const withoutQuery = url.split('?')[0];
            // Берём последнюю часть после последнего слеша
            const fileName = withoutQuery.split('/').pop();
            return fileName;
        } catch {
            return url; // если не удалось распарсить, вернуть всю строку
        }
    };

/*////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/

    /* Панель скриншотов */

    const [lastOpenedRow, setLastOpenedRow] = useState(null);       //переменная для отслеживания последней открытой строки(для выделения)
    const [modalImages, setModalImages] = useState(null);       //переменная с изображениями для открытой строки
    const [isModalOpen, setIsModalOpen] = useState(false);      //переменная состояния окна(открыто/закрыто)
    const [currentPlace, setCurrentPlace] = useState({ name: '', coords: '' });     //переменная с данными строки (для заголовка панели)

    /* Функция для открытия панели */
    const openGallery = (placeName, coords) => {
        const images = galleries[placeName];        //сохраняем изображения для данной строки
        if (images && images.length > 0) {      //если изображения есть...

            /* Сортируем изображения по имени */
            const sorted = [...images].sort((a, b) => {
                const nameA = getFileNameFromUrl(a);
                const nameB = getFileNameFromUrl(b);
                return nameA.localeCompare(nameB, undefined, { numeric: true });
            });

            setCurrentPlace({ name: placeName, coords: coords || '' });     //передаем заголовку информацию о строке
            setModalImages(sorted);     //сохраняем изображения для отображения
            setIsModalOpen(true);       //окно теперь открыто
            setLastOpenedRow(placeName); // запоминаем название открытой строки
        }
    };

    /* Функция для закрытия панели */
    const closeModal = () => setIsModalOpen(false);

    /* Функция оптимизации url для миниатюр */
    const getThumbUrl = (originalUrl) => {

            // параметры для миниатюр: ширина 150, высота 150, обрезка, автоформат, автокачество
            return originalUrl.replace('/upload/', '/upload/w_150,h_150,c_fill,q_auto,f_auto/');
    };

/*////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/

    /* Полноэкранная галерея */

    const [fullscreenImages, setFullscreenImages] = useState(null);     //задаём переменную с изображениями для открытия в полный экран
    const [fullscreenIndex, setFullscreenIndex] = useState(0);          //индекс изображения(для перелистывания и отслеживания)
    const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);    //переменная состояния полноэкранного режима(открыто/закрыто)

    /* Открытие полноэкранного режима */
    const openFullscreen = (images, index) => {         //передаем массив открытых изображений и индекс открытого
        setFullscreenImages(images);        //задаём значение переменной для полноэкранных изображений
        setFullscreenIndex(index);          //задаём индекс
        setIsFullscreenOpen(true);          //полноэкранный режим открыт
        document.body.style.overflow = 'hidden';        // блокируем прокрутку страницы
    };

    /* Переключение на следующее изображение */
    const nextImage = useCallback(() => {
        setFullscreenIndex((prev) => (prev + 1) % fullscreenImages.length);     //увеличиваем индекс изображения на 1
    }, [fullscreenImages]);

    /* Переключение на предыдущее изображение */
    const prevImage = useCallback(() => {
    setFullscreenIndex((prev) => (prev - 1 + fullscreenImages.length) % fullscreenImages.length);       //уменьшаем индекс изображения на 1
    }, [fullscreenImages]);

    /* Закрытие полноэкранного режима */
    const closeFullscreen = useCallback(() => {
        setIsFullscreenOpen(false);     //полный экран теперь закрыт
        setFullscreenImages(null);      //очищаем список изображений
        document.body.style.overflow = 'unset';     //разблокируем прокрутку
    }, []);

    /* Обработка нажатий клавиш */
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isFullscreenOpen) return;
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                nextImage();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                prevImage();
            } else if (e.key === 'Escape') {
                closeFullscreen();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFullscreenOpen, nextImage, prevImage, closeFullscreen]);

    /* Предзагрузка соседних изображений */
    useEffect(() => {
        if (!fullscreenImages) return;
        const preloadAdjacent = () => {
            const nextIdx = (fullscreenIndex + 1) % fullscreenImages.length;
            const prevIdx = (fullscreenIndex - 1 + fullscreenImages.length) % fullscreenImages.length;
            [nextIdx, prevIdx].forEach(idx => {
                const img = new Image();
                img.src = getFullscreenUrl(fullscreenImages[idx]);
            });
        };
        preloadAdjacent();
    }, [fullscreenIndex, fullscreenImages]);


    /* Оптимизируем url */
    const getFullscreenUrl = (originalUrl) => {

            return originalUrl.replace('/upload/', '/upload/q_auto,f_auto/');
    };

/*////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/

    /* Кнопка "Случайно" */

    /* Получаем список возможных для выбора строк */
    const placesWithImages = useMemo(() => {
        return topsJSON.filter(item => {
            const images = galleries[item.Название];
            return images && images.length > 0;
        });
    }, [topsJSON, galleries]);

    /* Случайно выбираем строку */
    const openRandomGallery = () => {
        if (placesWithImages.length === 0) return;      //если кандидатов нет выходим из фуункции
        const randomIndex = Math.floor(Math.random() * placesWithImages.length);        //получаем случайный индекс строки
        const randomPlace = placesWithImages[randomIndex];      //находим эту строку по индексу

        /* Плавная прокрутка к строке */
        const rowId = `row-${randomPlace.Название.replace(/\s+/g, '_')}`;       //узнаём id строки
        const element = document.getElementById(rowId);     //находим строку по id
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });        //переходим к ней
        }

        openGallery(randomPlace.Название, randomPlace.Координаты);              //открываем галерею
    };

/*////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/

    /* Фильтрация строк */

    /* Задаём переменные состояния */
    const [selectedColors, setSelectedColors] = useState(() =>
        new Set(colorFilters.map(c => c.hex))
    );                                                          //переменная для выбранных пользователем цветов. По умолчанию загружает все цвета из списка в файле tableFiltering.
    const [showSpecial, setShowSpecial] = useState(true);       //переменная, содержащая информацию о значении чекбокса "Город". По умолчанию включена.

    /* Обработчик изменения цвета пользователем */
    const handleColorChange = (hex, checked) => {   //передаем функции информацию о цвете и был ли он выбран
        setSelectedColors(prev => {                 //функция обновления списка цветов
            const newSet = new Set(prev);           //новая переменная со старым значением
            if (checked) {
                newSet.add(hex);                    //если цвет был выбран, добавляем его в список
            } else {
                newSet.delete(hex);                 //если цвет не был выбран, удаляем его из списка
            }
            return newSet;                          //возвращаем обновлённый список цветов
        });
    };

    /* Обработчик изменения чекбокса "Город" */
    const handleSpecialChange = (checked) => {
        setShowSpecial(checked);                    //просто обновляем значение в зависимости от состояния чекбокса
    };

    /* Фильтруем исходные данные с помощью функции из модуля tableFiltering.js */
    const filteredData = useMemo(() =>
         filterData(topsJSON, selectedColors, showSpecial), [topsJSON, selectedColors, showSpecial]);

/*////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/

    /* Поиск в таблице */

    /* Задаём переменные состояния */
    const [searchInput, setSearchInput] = useState('');                 //переменная со значением поля ввода, обновляется при каждом нажатии клавиши. По умолчанию пустое.

    /* Обработчик изменения поля поиска пользователем */
    const handleSearchChange = (e) =>
        setSearchInput(e.target.value);                                 //просто обновляем значение переменной

    /* Применяем функцию поиска из модуля tableSearching.js к отфильтрованным в прошлом блоке данным */
    const searchedData = useMemo(() =>
        searchData(filteredData, searchInput), [filteredData, searchInput]);

/*////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/

    // Сортируем данные в 3 раз с помощью модуля tablesorting.js
    const sortedTopsJSON = useMemo(() =>
        sortData(searchedData), [searchedData]);

    /* Получаем окончательную веб-страницу */
    if (loading) return <div className="loading">Загрузка...</div>;     //если данные еще не загрузились, отображаем это
    if (error) return <div className="error">Ошибка: {error}</div>;     //если возникла ошибка, отображаем её

    /* В остальных случаях возвращаем сайт */
    /* Конечная веб-страница: */
    return (
        <div className="App">
            {/* Основная панель над таблицей */}
            <div className="main-panel">

                {/* Панель фильтров */}
                <div className="filter-panel">
                    {colorFilters.map(c => (        /* Отрисовываем чекбоксы со значениями цветов из списка в виде ключей */
                        <label key={c.hex} className="checkbox-label">
                            {/* Функциональная часть чекбоксов */}
                            <input
                                type="checkbox"
                                checked={selectedColors.has(c.hex)}
                                onChange={(e) => handleColorChange(c.hex, e.target.checked)}
                                className="checkbox-input"
                            />
                            {/* Визуальная часть чекбоксов */}
                            <span className="checkbox-custom" style={{ backgroundColor: `#${c.hex}` }} />
                            <span className="checkbox-text">{c.name}</span>
                        </label>
                    ))}
                    <div>       {/* Чекбокс для городов */}
                        <label className="checkbox-label">
                            <input
                                className="checkbox-input"
                                type="checkbox"
                                checked={showSpecial}
                                onChange={(e) => handleSpecialChange(e.target.checked)}
                            />
                            <span className="checkbox-custom" style={{ backgroundColor: '#cccccc' }} />
                            <span className="checkbox-text"> {SPECIAL_SYMBOL.name} ({SPECIAL_SYMBOL.value})</span>
                        </label>
                    </div>
                </div>

                {/* Поисковая строка */}
                <div className="search-panel">
                    <input
                        className="search-input"
                        type="text"
                        value={searchInput}
                        onChange={handleSearchChange}
                        placeholder="Поиск..."
                    />

                    {/* Кнопка "Случайно" */}
                    <button className="random-button" onClick={openRandomGallery}>
                        🎲 Случайно
                    </button>
                </div>

                {/* Заголовок */}
                <h1>TOPS Photoalbum</h1>
            </div>

            {/* Таблица */}
            <div className="table-container" >
                <table className="tops-table">
                    {/* Шапка таблицы */}
                    <thead>
                        <tr>
                            <th>К-во</th>
                            <th>Название</th>
                            <th>Координаты</th>
                            <th>Описание</th>
                            <th>Авторы</th>
                            <th>Скриншоты</th>
                            <th>Дата нахождения</th>
                        </tr>
                    </thead>

                    {/* Отрисовка строк таблицы */}
                    <tbody>
                        {sortedTopsJSON.map((topsList, index) => {
                            //Строка-заголовок
                            if (topsList.isHeader) {
                                // Рендерим строку-заголовок с одной объединённой ячейкой
                                return (
                                    <tr key={index} className="section-header">
                                        <td colSpan={7}>
                                            {topsList["К-во"]}
                                        </td>
                                    </tr>
                                );
                            } else {
                                //задаём id для каждой обычной строки (заменяем запрещённые символы в id)
                                const rowId = `row-${topsList.Название.replace(/\s+/g, '_')}`;
                                // Обычная строка с данными
                                return (
                                    <tr
                                        key={index}
                                        id={rowId}
                                        className={lastOpenedRow === topsList.Название ? 'highlighted-row' : ''}
                                    >
                                        <td style={{ backgroundColor: topsList.color ? `#${topsList.color}` : 'transparent' }}>     {/* Задаём цвет строки в зависимости от качества */}
                                            {topsList["К-во"]}
                                        </td>
                                        <td><HighlightText text={topsList.Название} highlight={searchInput} /></td>
                                        <td><HighlightText text={topsList.Координаты} highlight={searchInput} /></td>
                                        <td><HighlightText text={topsList.Описание} highlight={searchInput} /></td>
                                        <td><HighlightText text={topsList.Авторы} highlight={searchInput} /></td>

                                        {/* Столбец скриншотов */}
                                        <td>
                                            {(() => {
                                                const placeName = topsList.Название;
                                                const coords = topsList.Координаты;
                                                const images = galleries[placeName];
                                                if (!images || images.length === 0) {
                                                    return <span className="no-photos">Не хватило памяти в облаке</span>;
                                                };
                                                return (
                                                    <button
                                                        className="gallery-button"
                                                        onClick={() => openGallery(placeName, coords)}
                                                        title=""
                                                    >
                                                    📷 {images.length}
                                                    </button>
                                                );
                                            })()}
                                        </td>

                                        <td><HighlightText text={topsList["Дата нахождения"]} highlight={searchInput} /></td>
                                    </tr>
                                );
                            }
                        })}

                        {/* Панель скриншотов */}
                        {isModalOpen && (
                            <div className="modal-overlay" onClick={closeModal}>
                                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                    <button className="modal-close" onClick={closeModal}>×</button>

                                    {/* Заголовок панели скриншотов */}
                                    <h2 className="modal-title">
                                        {currentPlace.name} | {currentPlace.coords || 'координаты не указаны'}
                                    </h2>

                                    {/* Рендерим изображения */}
                                    <div className="modal-images">
                                        {modalImages.map((img, idx) => (
                                            <img
                                                key={idx}
                                                src={getThumbUrl(img)}
                                                alt={`image-${idx}`}
                                                className="modal-thumb"
                                                onClick={() => openFullscreen(modalImages, idx)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Полноэкранный режим */}
                        {isFullscreenOpen && (
                            <div className="fullscreen-overlay" onClick={closeFullscreen}>
                                <div className="fullscreen-content" onClick={(e) => e.stopPropagation()}>
                                    <button className="fullscreen-close" onClick={closeFullscreen}>×</button>

                                    <button className="fullscreen-nav fullscreen-prev" onClick={prevImage}>‹</button>

                                    <img
                                        src={getFullscreenUrl(fullscreenImages[fullscreenIndex])}
                                        alt="fullscreen"
                                        className="fullscreen-image"
                                    />

                                    <button className="fullscreen-nav fullscreen-next" onClick={nextImage}>›</button>

                                    <div className="fullscreen-counter">
                                        {fullscreenIndex + 1} / {fullscreenImages.length}
                                    </div>
                                </div>
                            </div>
                        )}

                        <p>Всего записей: {sortedTopsJSON.filter(item => item.isHeader === null).length}</p>

                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default App;