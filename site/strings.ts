// Every piece of interface text, in each language the site is built in.
// Entry text is not here: English entries live in dictionary/, and their
// Vietnamese translations in translations/vi/.

export type Lang = "vi" | "en";

/** The first language is the default one, published at the site root. */
export const LANGS: Lang[] = ["vi", "en"];

/** URL prefix of each language. The default language has none. */
export const BASE: Record<Lang, string> = { vi: "", en: "/en" };

export type Strings = {
  /** Name of the language, written in that language. */
  languageName: string;
  /** Short label on the language toggle. */
  languageCode: string;
  languageToggle: string;
  siteName: string;
  tagline: string;
  /** "{name}" is replaced by the linked author name. */
  credit: string;
  skip: string;
  navLabel: string;
  navMap: string;
  navCurriculum: string;
  navAz: string;
  searchPlaceholder: string;
  searchLabel: string;
  searchResults: string;
  searchNoMatch: string;
  searchError: string;
  themeToggle: string;

  section: string;
  sectionsLabel: string;
  termCount: string;
  curriculumTitle: string;
  curriculumDescription: string;
  curriculumIntro: string;
  curriculumMeta: string;
  curriculumStart: string;

  azDescription: string;
  azLede: string;
  lettersLabel: string;

  mapLabel: string;
  mapHint: string;
  mapLoading: string;
  /** "{link}" wraps the words that link to the curriculum. */
  mapFallback: string;
  mapError: string;
  mapControls: string;
  zoomIn: string;
  zoomOut: string;
  resetView: string;
  closeTerm: string;
  relatedTerms: string;
  openAsPage: string;
  /** Used by the map panel: {n}, {title}, {i}, {total}. */
  panelEyebrow: string;

  termOf: string;
  viewInMap: string;
  usage: string;
  mentionedIn: string;
  pagerLabel: string;
  previous: string;
  next: string;
  notTranslated: string;

  notFoundTitle: string;
  notFoundDescription: string;
  notFoundLede: string;
  /** {map}, {curriculum} and {az} wrap the linked words. */
  notFoundHelp: string;

  /** Section titles, keyed by the English title in internal/Curriculum.md. */
  sectionTitles: Record<string, string>;
};

export const STRINGS: Record<Lang, Strings> = {
  vi: {
    languageName: "Tiếng Việt",
    languageCode: "VI",
    languageToggle: "Ngôn ngữ",
    siteName: "Từ điển AI Coding",
    tagline: "Từ vựng về lập trình với AI, giải thích bằng tiếng Việt dễ hiểu.",
    // Kept in English in both languages: the wording is fixed.
    credit: "Built by {name}.",
    skip: "Tới nội dung chính",
    navLabel: "Các chế độ xem",
    navMap: "Bản đồ",
    navCurriculum: "Giáo trình",
    navAz: "A–Z",
    searchPlaceholder: "Tìm trong {count} thuật ngữ",
    searchLabel: "Tìm thuật ngữ",
    searchResults: "Thuật ngữ khớp",
    searchNoMatch: "Không có thuật ngữ nào khớp với “{q}”.",
    searchError: "Không tải được dữ liệu tìm kiếm. Hãy thử danh sách A–Z.",
    themeToggle: "Đổi giao diện sáng hoặc tối",

    section: "Phần {n}",
    sectionsLabel: "Các phần",
    termCount: "{count} thuật ngữ",
    curriculumTitle: "Giáo trình",
    curriculumDescription:
      "Toàn bộ {count} thuật ngữ trong {site}, theo thứ tự nên học.",
    curriculumIntro:
      "Vì sao ngữ cảnh xuống cấp? Vì sao hoá đơn cao thế? Vì sao cùng một prompt mà hôm nay chạy khác hôm qua? Mỗi câu hỏi đều có lời giải rõ ràng, khi bạn biết đúng từ để gọi tên vấn đề.",
    curriculumMeta:
      "{count} thuật ngữ trong {sections} phần, sắp xếp để mỗi thuật ngữ dựa trên những thuật ngữ đứng trước.",
    curriculumStart: "Bắt đầu với “{term}”",

    azDescription:
      "Toàn bộ {count} thuật ngữ trong {site}, theo thứ tự bảng chữ cái.",
    azLede: "Toàn bộ {count} thuật ngữ theo thứ tự bảng chữ cái.",
    lettersLabel: "Chữ cái",

    mapLabel:
      "Bản đồ 3D gồm {count} thuật ngữ. Dùng phím mũi tên để xoay, phím cộng và trừ để phóng to, thu nhỏ. Để mở một thuật ngữ, hãy dùng ô tìm kiếm hoặc danh sách giáo trình.",
    mapHint:
      "{count} thuật ngữ và {links} liên kết giữa chúng. Kéo để xoay, cuộn để phóng to, chọn một thuật ngữ để đọc.",
    mapLoading: "Đang tải bản đồ…",
    mapFallback:
      "Các thuật ngữ này cũng có trong {link}danh sách giáo trình{/link}.",
    mapError: "Không tải được bản đồ.",
    mapControls: "Điều khiển bản đồ",
    zoomIn: "Phóng to",
    zoomOut: "Thu nhỏ",
    resetView: "Đặt lại góc nhìn",
    closeTerm: "Đóng thuật ngữ này",
    relatedTerms: "Thuật ngữ liên quan",
    openAsPage: "Mở thuật ngữ này thành trang riêng",
    panelEyebrow: "Phần {n} — {title} · Thuật ngữ {i}/{total}",

    termOf: "Thuật ngữ {i}/{total}",
    viewInMap: "Xem trên bản đồ",
    usage: "Cách dùng",
    mentionedIn: "Được nhắc tới trong",
    pagerLabel: "Thuật ngữ trước và sau",
    previous: "Trước",
    next: "Sau",
    notTranslated:
      "Mục này chưa có bản dịch tiếng Việt. Dưới đây là bản tiếng Anh.",

    notFoundTitle: "Không tìm thấy trang",
    notFoundDescription: "Trang này không tồn tại.",
    notFoundLede: "Không có mục nào ở địa chỉ này.",
    notFoundHelp:
      "Hãy tìm thuật ngữ ở ô phía trên, hoặc xem {map}bản đồ{/map}, {curriculum}giáo trình{/curriculum} hay {az}danh sách A–Z{/az}.",

    sectionTitles: {
      "The Model": "Mô hình",
      "Sessions, Context Windows & Turns": "Phiên, cửa sổ ngữ cảnh và lượt",
      "Tools & Environment": "Công cụ và môi trường",
      "Failure Modes": "Các kiểu lỗi",
      Handoffs: "Bàn giao",
      "Memory and Steering": "Bộ nhớ và điều hướng",
      "Patterns of Work": "Các cách làm việc",
    },
  },

  en: {
    languageName: "English",
    languageCode: "EN",
    languageToggle: "Language",
    siteName: "AI Coding Dictionary",
    tagline: "The vocabulary of AI coding, translated into plain English.",
    credit: "Built by {name}.",
    skip: "Skip to content",
    navLabel: "Views",
    navMap: "Map",
    navCurriculum: "Curriculum",
    navAz: "A–Z",
    searchPlaceholder: "Search {count} terms",
    searchLabel: "Search terms",
    searchResults: "Matching terms",
    searchNoMatch: "No term matches “{q}”.",
    searchError: "Search could not load. Try the A–Z list.",
    themeToggle: "Switch colour theme",

    section: "Section {n}",
    sectionsLabel: "Sections",
    termCount: "{count} terms",
    curriculumTitle: "Curriculum",
    curriculumDescription:
      "All {count} terms in the {site}, in the order that teaches them.",
    curriculumIntro:
      "Why does context degrade? Why is the bill so high? Why does the same prompt behave differently from one day to the next? Each has a clean answer, once someone tells you the words to use.",
    curriculumMeta:
      "{count} terms in {sections} sections, ordered so each one builds on the last.",
    curriculumStart: "Start with “{term}”",

    azDescription: "All {count} terms in the {site}, in alphabetical order.",
    azLede: "All {count} terms in alphabetical order.",
    lettersLabel: "Letters",

    mapLabel:
      "3D map of {count} terms. Arrow keys rotate it, plus and minus zoom. To open a term, use search or the curriculum list.",
    mapHint:
      "{count} terms and the {links} links between them. Drag to rotate, scroll to zoom, select a term to read it.",
    mapLoading: "Loading the map…",
    mapFallback: "The same terms are in the {link}curriculum list{/link}.",
    mapError: "The map could not load.",
    mapControls: "Map view",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    resetView: "Reset the view",
    closeTerm: "Close this term",
    relatedTerms: "Related terms",
    openAsPage: "Open this term as a page",
    panelEyebrow: "Section {n} — {title} · Term {i} of {total}",

    termOf: "Term {i} of {total}",
    viewInMap: "View in map",
    usage: "Usage",
    mentionedIn: "Mentioned in",
    pagerLabel: "Previous and next term",
    previous: "Previous",
    next: "Next",
    notTranslated: "",

    notFoundTitle: "Page not found",
    notFoundDescription: "This page does not exist.",
    notFoundLede: "There is no entry at this address.",
    notFoundHelp:
      "Search for a term above, or browse the {map}map{/map}, the {curriculum}curriculum{/curriculum} or the {az}A–Z list{/az}.",

    sectionTitles: {},
  },
};

/** Replace each "{key}" in a template with its value. */
export function fill(
  template: string,
  values: Record<string, string | number>
): string {
  return template.replace(/\{(\/?\w+)\}/g, (whole, key: string) =>
    key in values ? String(values[key]) : whole
  );
}
