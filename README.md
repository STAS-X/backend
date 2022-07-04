# Backend

Ссылка на итоговый готовый дипломный проект https://a7808-87e9.f.d-f.pw

Проект написан в марте-мае 2022 года, основной стэком Frontend-фреймворков при написании проекта был **React/Redux/React-Admin**

`FrontEnd` включает в себя следующие библиотеки:
- Использование **Auth Route** для ограничения доступа неавторизованных пользователей
- Ограничение доступа к данным реализовано на базе библиотеки **FireBaseUI** (`Google Auth/Email/Phone - Captcha`)
- Ограничение доступа "напрямую" к базе данных через написание `Firestore Rules`
- Пользовательский интерфейс (объекты, диалоги и анимации **UI**) реализованы на базе библиотеки `Material UI`
- Реализация взаимодействия Front-Back по протоколу HTTP (сервис `REST API`) на базе библиотеки **axios**
- Анимация динамических объектов и всплывающих подсказок - **AnimateCSS и pure css**

`Backеnd` реализация включает в себя библиотеки:
- **Express** создание веб сервера и маршрутизация запросов (`route get/put/post/delete`)
- **Express Validator** оконечная валидация данных на базе модели сущностей
- **Firebase Admin** взаимодействие между провайдером данных (`dataProvider/frontend`) и облачной БД (`firestore`)
- **NodeJS** среда исполнения серверной части кода проекта.

# Вкратце о дипломном проекте

Основная концепция - управление текущими задачами пользователей (назначение/изменение/удаление/слежение), включая возможность дополнительного комментирования для пояснения текущего состояния. 

Целью проекта является связывание в единый программный комплекс 3-х блоков: 

1)  **пользовательский интерфейс (UI)** (`frontend`);
2)  **middleware**  - взаимодействие с глобальным состоянием приложения через `Redux/Thunk`;
3)  **серверная часть** (`backend`) валидация и "прокидывание" данных между клиентом/сервером и базой данных.

Проект включает в себя возможности:

- регистрация/авторизация пользователей (**FireBaseUI**);
- управление отображением объектов сущностей (**React Admin**) на базе разнообразных модулей для редакториования/создания/отображения и анимации с данными;
- редактирование профиля пользователя;
- добавление комментариев к задаче (для поснения текущего состстояния исполнения).

Стилизация и адаптация отображения графических элементов на базе библиотеки **MaterialUI**
