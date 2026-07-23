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
  | 'close';

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
  },
};

export function t(locale: AppLocale, key: MessageKey): string {
  return messages[locale][key];
}
