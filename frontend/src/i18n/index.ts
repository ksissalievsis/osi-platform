const translations = {
  ru: {
    login: 'Вход', phone: 'Номер телефона', sendCode: 'Отправить код', enterCode: 'Введите код',
    verify: 'Подтвердить', logout: 'Выйти', requests: 'Заявки', newRequest: 'Новая заявка',
    myRequests: 'Мои заявки', allRequests: 'Все заявки', assignedToMe: 'Назначены мне',
    category: 'Категория', description: 'Описание', submit: 'Отправить заявку',
    status: 'Статус', notifications: 'Уведомления', settings: 'Настройки', profile: 'Профиль',
    admin: 'Администратор', executor: 'Исполнитель', resident: 'Житель',
    statuses: {
      new: 'Новая', accepted: 'Принята', assigned: 'Назначен исполнитель',
      in_progress: 'В работе', done: 'Выполнена', closed: 'Закрыта'
    },
    name: 'Имя', building: 'Дом', entrance: 'Подъезд', apartment: 'Квартира',
    save: 'Сохранить', cancel: 'Отмена', assignExecutor: 'Назначить исполнителя',
    changeStatus: 'Изменить статус', history: 'История', comments: 'Комментарии',
    addComment: 'Добавить комментарий', send: 'Отправить', filter: 'Фильтр',
    users: 'Пользователи', categories: 'Категории', dashboard: 'Главная',
    loading: 'Загрузка...', error: 'Ошибка', noData: 'Нет данных',
    lang: 'RU'
  },
  kz: {
    login: 'Кіру', phone: 'Телефон нөмірі', sendCode: 'Код жіберу', enterCode: 'Кодты енгізіңіз',
    verify: 'Растау', logout: 'Шығу', requests: 'Өтінімдер', newRequest: 'Жаңа өтінім',
    myRequests: 'Менің өтінімдерім', allRequests: 'Барлық өтінімдер', assignedToMe: 'Маған тағайындалған',
    category: 'Санат', description: 'Сипаттама', submit: 'Өтінім жіберу',
    status: 'Мәртебе', notifications: 'Хабарламалар', settings: 'Баптаулар', profile: 'Профиль',
    admin: 'Әкімші', executor: 'Орындаушы', resident: 'Тұрғын',
    statuses: {
      new: 'Жаңа', accepted: 'Қабылданды', assigned: 'Орындаушы тағайындалды',
      in_progress: 'Жұмыста', done: 'Орындалды', closed: 'Жабылды'
    },
    name: 'Аты', building: 'Үй', entrance: 'Кіреберіс', apartment: 'Пәтер',
    save: 'Сақтау', cancel: 'Болдырмау', assignExecutor: 'Орындаушы тағайындау',
    changeStatus: 'Мәртебені өзгерту', history: 'Тарих', comments: 'Пікірлер',
    addComment: 'Пікір қосу', send: 'Жіберу', filter: 'Сүзгі',
    users: 'Пайдаланушылар', categories: 'Санаттар', dashboard: 'Басты',
    loading: 'Жүктелуде...', error: 'Қате', noData: 'Деректер жоқ',
    lang: 'KZ'
  }
}

export type Lang = 'ru' | 'kz'
export const t = (lang: Lang, key: string): string => {
  const keys = key.split('.')
  let val: any = translations[lang]
  for (const k of keys) val = val?.[k]
  return val ?? key
}
export default translations
