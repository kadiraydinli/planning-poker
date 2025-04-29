/**
 * Planning Poker uygulaması için renk haritası
 * Her puan değeri için sabit bir renk atanmıştır
 */

export const POINT_COLORS: {[key: string]: string} = {
  // Sayısal değerler
  "0": "#003366", // koyu lacivert
  "½": "#00CCFF", // parlak açık mavi
  "1": "#FFD700", // altın
  "2": "#FF5722", // derin turuncu
  "3": "#E91E63", // parlak pembe
  "4": "#673AB7", // derin mor
  "5": "#4CAF50", // orta yeşil
  "8": "#8E44AD", // mor patlıcan
  "13": "#FF9800", // turuncu
  "16": "#B71C1C", // koyu kırmızı
  "20": "#2196F3", // parlak mavi
  "21": "#6A1B9A", // koyu mor
  "32": "#009688", // turkuaz
  "34": "#3F51B5", // indigo
  "40": "#FF4081", // parlak pembe-kırmızı
  "55": "#0097A7", // koyu camgöbeği
  "64": "#7E57C2", // orta mor
  "89": "#6D4C41", // kahverengi
  "100": "#D32F2F", // parlak kırmızı
  
  // T-shirt boyutları
  "XS": "#01579B", // koyu mavi 
  "S": "#0288D1",  // orta mavi
  "M": "#512DA8",  // mor
  "L": "#7B1FA2",  // koyu mor
  "XL": "#D81B60", // pembe
  "XXL": "#880E4F", // koyu pembe
  
  // Özel semboller
  "☕": "#795548", // derin kahverengi
  "?": "#9C27B0"   // mor
};

/**
 * Bir puan değeri için renk döndürür
 * @param point Puan değeri
 * @param defaultColor Varsayılan renk (puan için renk bulunamazsa kullanılır)
 * @returns Renk kodu (hex formatında)
 */
export const getPointColor = (point: string, defaultColor: string = "#808080"): string => {
  return POINT_COLORS[point] || defaultColor;
}; 