export type AppLocale = 'ar' | 'ku' | 'en';

export const RTL_LOCALES: AppLocale[] = ['ar', 'ku'];

export function isRtlLocale(locale: AppLocale): boolean {
  return RTL_LOCALES.includes(locale);
}

export type MessageKey =
  | 'continue'
  | 'cancel'
  | 'retry'
  | 'loading'
  | 'emptyTitle'
  | 'emptyBody'
  | 'errorTitle'
  | 'errorBody'
  | 'search'
  | 'home'
  | 'sell'
  | 'inbox'
  | 'account'
  | 'save'
  | 'close'
  | 'vehicles'
  | 'plates'
  | 'dealers'
  | 'featuredVehicles'
  | 'featuredPlates'
  | 'newestVehicles'
  | 'newestPlates'
  | 'categories'
  | 'settings'
  | 'myVehicles'
  | 'myPlates'
  | 'savedItems'
  | 'language'
  | 'appearance'
  | 'darkMode'
  | 'lightMode'
  | 'systemMode'
  | 'onboardingTitle'
  | 'onboardingBody'
  | 'getStarted'
  | 'searchVehicles'
  | 'searchPlates'
  | 'profile'
  | 'logout'
  | 'favorites';

export const messages: Record<AppLocale, Record<MessageKey, string>> = {
  ar: {
    continue: 'متابعة',
    cancel: 'إلغاء',
    retry: 'إعادة المحاولة',
    loading: 'جاري التحميل…',
    emptyTitle: 'لا توجد نتائج',
    emptyBody: 'جرّب تعديل الفلاتر أو البحث بكلمات أخرى.',
    errorTitle: 'حدث خطأ',
    errorBody: 'تعذّر إكمال الطلب. حاول مرة أخرى.',
    search: 'بحث',
    home: 'الرئيسية',
    sell: 'بيع',
    inbox: 'الوارد',
    account: 'حسابي',
    save: 'حفظ',
    close: 'إغلاق',
    vehicles: 'مركبات',
    plates: 'أرقام',
    dealers: 'المعارض',
    featuredVehicles: 'مركبات مميزة',
    featuredPlates: 'أرقام مميزة',
    newestVehicles: 'أحدث المركبات',
    newestPlates: 'أحدث الأرقام',
    categories: 'الفئات',
    settings: 'الإعدادات',
    myVehicles: 'مركباتي',
    myPlates: 'أرقامي',
    savedItems: 'المحفوظات',
    language: 'اللغة',
    appearance: 'المظهر',
    darkMode: 'داكن',
    lightMode: 'فاتح',
    systemMode: 'تلقائي',
    onboardingTitle: 'سوق العراق للمركبات والأرقام',
    onboardingBody: 'تصفّح المركبات والأرقام، تواصل مع البائعين، وأدر إعلاناتك بسهولة.',
    getStarted: 'ابدأ الآن',
    searchVehicles: 'بحث المركبات',
    searchPlates: 'بحث الأرقام',
    profile: 'الملف الشخصي',
    logout: 'تسجيل الخروج',
    favorites: 'المفضلة',
  },
  ku: {
    continue: 'بەردەوامبە',
    cancel: 'هەڵوەشاندنەوە',
    retry: 'دووبارە هەوڵبدە',
    loading: 'بارکردن…',
    emptyTitle: 'هیچ ئەنجامێک نییە',
    emptyBody: 'فلتەرەکان بگۆڕە یان بە وشەی تر بگەڕێ.',
    errorTitle: 'هەڵەیەک ڕوویدا',
    errorBody: 'داواکارییەکە سەرکەوتوو نەبوو. دووبارە هەوڵبدە.',
    search: 'گەڕان',
    home: 'سەرەکی',
    sell: 'فرۆشتن',
    inbox: 'نامەکان',
    account: 'هەژمار',
    save: 'پاشەکەوت',
    close: 'داخستن',
    vehicles: 'ئۆتۆمبێل',
    plates: 'ژمارەکان',
    dealers: 'فرۆشیارەکان',
    featuredVehicles: 'ئۆتۆمبێلی تایبەت',
    featuredPlates: 'ژمارەی تایبەت',
    newestVehicles: 'نوێترین ئۆتۆمبێل',
    newestPlates: 'نوێترین ژمارە',
    categories: 'پۆلەکان',
    settings: 'ڕێکخستنەکان',
    myVehicles: 'ئۆتۆمبێلەکانم',
    myPlates: 'ژمارەکانم',
    savedItems: 'پاشەکەوتکراوەکان',
    language: 'زمان',
    appearance: 'ڕووکار',
    darkMode: 'تاریک',
    lightMode: 'ڕووناک',
    systemMode: 'سیستەم',
    onboardingTitle: 'بازاڕی ئۆتۆمبێل و ژمارە لە عێراق',
    onboardingBody: 'ئۆتۆمبێل و ژمارە بگەڕێ، پەیوەندی بە فرۆشیار بکە، و ڕیکلامەکانت بەڕێوەببە.',
    getStarted: 'دەستپێبکە',
    searchVehicles: 'گەڕانی ئۆتۆمبێل',
    searchPlates: 'گەڕانی ژمارە',
    profile: 'پرۆفایل',
    logout: 'دەرچوون',
    favorites: 'دڵخوازەکان',
  },
  en: {
    continue: 'Continue',
    cancel: 'Cancel',
    retry: 'Retry',
    loading: 'Loading…',
    emptyTitle: 'Nothing here yet',
    emptyBody: 'Try adjusting filters or searching with different keywords.',
    errorTitle: 'Something went wrong',
    errorBody: 'We could not complete that request. Please try again.',
    search: 'Search',
    home: 'Home',
    sell: 'Sell',
    inbox: 'Inbox',
    account: 'Account',
    save: 'Save',
    close: 'Close',
    vehicles: 'Vehicles',
    plates: 'Plates',
    dealers: 'Dealers',
    featuredVehicles: 'Featured vehicles',
    featuredPlates: 'Featured plates',
    newestVehicles: 'Newest vehicles',
    newestPlates: 'Newest plates',
    categories: 'Categories',
    settings: 'Settings',
    myVehicles: 'My vehicles',
    myPlates: 'My plates',
    savedItems: 'Saved items',
    language: 'Language',
    appearance: 'Appearance',
    darkMode: 'Dark',
    lightMode: 'Light',
    systemMode: 'System',
    onboardingTitle: 'Iraq’s vehicles & plates marketplace',
    onboardingBody: 'Browse vehicles and plates, contact sellers, and manage your listings.',
    getStarted: 'Get started',
    searchVehicles: 'Search vehicles',
    searchPlates: 'Search plates',
    profile: 'Profile',
    logout: 'Log out',
    favorites: 'Favorites',
  },
};

export function t(locale: AppLocale, key: MessageKey): string {
  return messages[locale][key];
}
