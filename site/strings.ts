// Every piece of interface text, in each language the site is built in.
// Entry text is not here: English entries live in dictionary/, and their
// Vietnamese translations in translations/vi/.

export type Lang = "vi" | "en";

/** The states a decision record in internal/adr/ can be in. */
export type AdrStatus = "proposed" | "accepted" | "rejected" | "superseded";

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
  navLearn: string;
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

  /** The label that opens an "avoid" note in an entry, as the build renders it. */
  avoidMarker: string;

  learnTitle: string;
  learnDescription: string;
  learnCourse: string;
  learnOpenCourse: string;
  learnCloseCourse: string;
  learnProgress: string;
  learnReset: string;
  learnResetConfirm: string;
  learnResetConfirmSynced: string;
  learnSignIn: string;
  learnSignInHint: string;
  learnSigningIn: string;
  learnSignInUnavailable: string;
  learnSignInFailed: string;
  learnSignOut: string;
  learnSignOutConfirm: string;
  learnSyncing: string;
  learnSynced: string;
  learnSyncError: string;
  learnLoading: string;
  learnError: string;
  /** "{link}" wraps the words that link to the curriculum. */
  learnNoScript: string;
  learnTermInSection: string;
  learnStepOf: string;
  learnSteps: string;
  learnStepsLabel: string;
  learnLinks: string;
  learnKindDef: string;
  learnKindMore: string;
  learnKindNote: string;
  learnKindUsage: string;
  learnKindRecap: string;
  learnKeyIdea: string;
  learnBack: string;
  /** "{label}" is the name of the next step or the next term. */
  learnNext: string;
  learnFinished: string;
  learnHint: string;
  learnHudOut: string;
  learnHudIn: string;
  learnHudBoth: string;
  learnToolMap: string;
  learnLegendHit: string;
  learnLegendSeen: string;
  learnLegendAhead: string;
  learnLegendBoth: string;
  learnDiagram: string;
  learnNoLinks: string;
  learnPrereq: string;
  learnPrereqNone: string;
  learnDone: string;
  learnTermDone: string;

  tasksNav: string;
  tasksTitle: string;
  /** "{site}" is replaced by the site name. */
  tasksDescription: string;
  tasksLede: string;
  tasksSidebar: string;
  tasksProject: string;
  tasksViews: string;
  tasksOpen: string;
  tasksDoing: string;
  tasksDone: string;
  tasksAll: string;
  tasksLabels: string;
  tasksListTitle: string;
  tasksAdd: string;
  tasksShare: string;
  tasksCopied: string;
  tasksColTask: string;
  tasksColAssignee: string;
  tasksColStatus: string;
  tasksColUpdated: string;
  tasksUnassigned: string;
  /** "{count}" is replaced by a number. */
  tasksComments: string;
  tasksEmpty: string;
  tasksEmptyOpen: string;
  tasksEmptyAll: string;
  tasksLoading: string;
  /** "{time}" is replaced by a time of day, or a date and a time. */
  tasksUpdated: string;
  tasksStale: string;
  tasksError: string;
  tasksRefresh: string;
  tasksOnGithub: string;
  /** "{link}" wraps the words that link to the issues on GitHub. */
  tasksNoScript: string;
  tasksDecisions: string;
  tasksDecisionsLede: string;
  tasksPending: string;
  tasksAdrStatus: Record<AdrStatus, string>;
  /** Names shown for known issue labels. Other labels show as written. */
  tasksLabelNames: Record<string, string>;

  notFoundTitle: string;
  notFoundDescription: string;
  notFoundLede: string;
  /** {map}, {learn}, {curriculum} and {az} wrap the linked words. */
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
    navLearn: "Học",
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
    openAsPage: "Trang riêng",
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

    avoidMarker: "Nên tránh:",

    learnTitle: "Học từng bước",
    learnDescription:
      "Học {count} thuật ngữ trong {site} theo từng bước, có sơ đồ liên kết cho mỗi thuật ngữ và lưu tiến độ của bạn.",
    learnCourse: "Khoá học",
    learnOpenCourse: "Mở danh sách khoá học",
    learnCloseCourse: "Đóng danh sách khoá học",
    learnProgress: "Tiến độ",
    learnReset: "Đặt lại tiến độ",
    learnResetConfirm: "Xoá toàn bộ tiến độ học trên trình duyệt này?",
    learnResetConfirmSynced:
      "Xoá toàn bộ tiến độ học của tài khoản này, trên mọi thiết bị?",
    learnSignIn: "Đăng nhập bằng Google",
    learnSignInHint: "Để đồng bộ tiến độ giữa các thiết bị.",
    learnSigningIn: "Đang đăng nhập…",
    learnSignInUnavailable: "Đăng nhập bằng Google hiện chưa dùng được.",
    learnSignInFailed: "Đăng nhập không thành công.",
    learnSignOut: "Đăng xuất",
    learnSignOutConfirm:
      "Đăng xuất? Tiến độ đã đồng bộ vẫn nằm trong tài khoản. Trình duyệt này sẽ bắt đầu lại với tiến độ trống.",
    learnSyncing: "Đang đồng bộ…",
    learnSynced: "Đã đồng bộ",
    learnSyncError: "Lỗi đồng bộ. Thử lại",
    learnLoading: "Đang tải khoá học…",
    learnError: "Không tải được khoá học. Hãy tải lại trang.",
    learnNoScript:
      "Chế độ xem này cần JavaScript. Các thuật ngữ cũng có trong {link}danh sách giáo trình{/link}.",
    learnTermInSection: "Thuật ngữ {i} trên {total}",
    learnStepOf: "Bước {i} / {total}",
    learnSteps: "{count} bước",
    learnStepsLabel: "Các bước",
    learnLinks: "{count} liên kết",
    learnKindDef: "Định nghĩa",
    learnKindMore: "Giải thích",
    learnKindNote: "Lưu ý",
    learnKindUsage: "Cách dùng",
    learnKindRecap: "Tóm tắt",
    learnKeyIdea: "Ý chính",
    learnBack: "Lùi",
    learnNext: "Tiếp: {label}",
    learnFinished: "Đã hết khoá học",
    learnHint: "chuyển bước",
    learnHudOut: "Liên kết tới",
    learnHudIn: "Được nhắc tới",
    learnHudBoth: "Hai chiều",
    learnToolMap: "Bản đồ 3D",
    learnLegendHit: "nhắc tới ở bước này",
    learnLegendSeen: "đã nhắc tới",
    learnLegendAhead: "chưa nhắc tới",
    learnLegendBoth: "liên kết hai chiều",
    learnDiagram: "Sơ đồ các thuật ngữ mà “{term}” liên kết tới",
    learnNoLinks: "Thuật ngữ này không liên kết tới thuật ngữ nào.",
    learnPrereq: "Nên biết trước",
    learnPrereqNone: "Không cần biết trước thuật ngữ nào.",
    learnDone: "đã học",
    learnTermDone: "Đã học xong: {term}",

    tasksNav: "Công việc",
    tasksTitle: "Bảng công việc",
    tasksDescription:
      "Các task đang mở và các quyết định của dự án {site}, đọc từ GitHub.",
    tasksLede:
      "Các task và quyết định của dự án, đọc trực tiếp từ GitHub. Bấm vào một task để mở issue của nó.",
    tasksSidebar: "Bộ lọc task",
    tasksProject: "Dự án",
    tasksViews: "Xem",
    tasksOpen: "Đang mở",
    tasksDoing: "Đang làm",
    tasksDone: "Đã xong",
    tasksAll: "Tất cả",
    tasksLabels: "Nhãn",
    tasksListTitle: "Task",
    tasksAdd: "Thêm task",
    tasksShare: "Chia sẻ",
    tasksCopied: "Đã chép liên kết",
    tasksColTask: "Tên task",
    tasksColAssignee: "Người phụ trách",
    tasksColStatus: "Trạng thái",
    tasksColUpdated: "Cập nhật",
    tasksUnassigned: "Chưa giao",
    tasksComments: "{count} bình luận",
    tasksEmpty: "Không có task nào ở mục này.",
    tasksEmptyOpen: "Không còn task nào đang mở.",
    tasksEmptyAll: "Kho này chưa có issue nào trên GitHub.",
    tasksLoading: "Đang tải từ GitHub…",
    tasksUpdated: "Cập nhật lúc {time}",
    tasksStale:
      "Không tải được dữ liệu mới từ GitHub. Đang hiện bản lưu lúc {time}.",
    tasksError: "Không tải được danh sách task từ GitHub.",
    tasksRefresh: "Làm mới",
    tasksOnGithub: "Xem trên GitHub",
    tasksNoScript:
      "Trang này cần JavaScript để tải danh sách task. {link}Xem các issue trên GitHub{/link}.",
    tasksDecisions: "Quyết định (ADR)",
    tasksDecisionsLede:
      "Mỗi quyết định về kiến trúc là một tệp trong internal/adr/. Quyết định ở trạng thái đề xuất đang chờ chủ dự án chọn.",
    tasksPending: "Chờ quyết định",
    tasksAdrStatus: {
      proposed: "Đề xuất",
      accepted: "Đã chấp nhận",
      rejected: "Đã bác",
      superseded: "Đã thay thế",
    },
    tasksLabelNames: {
      bug: "Lỗi",
      documentation: "Tài liệu",
      enhancement: "Cải tiến",
      question: "Câu hỏi",
      "needs-triage": "Chờ phân loại",
      "needs-info": "Chờ thông tin",
      "ready-for-agent": "Giao cho agent",
      "ready-for-human": "Cần người làm",
      wontfix: "Không làm",
    },

    notFoundTitle: "Không tìm thấy trang",
    notFoundDescription: "Trang này không tồn tại.",
    notFoundLede: "Không có mục nào ở địa chỉ này.",
    notFoundHelp:
      "Hãy tìm thuật ngữ ở ô phía trên, hoặc xem {map}bản đồ{/map}, {learn}khoá học{/learn}, {curriculum}giáo trình{/curriculum} hay {az}danh sách A–Z{/az}.",

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
    navLearn: "Learn",
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
    openAsPage: "Full page",
    panelEyebrow: "Section {n} — {title} · Term {i} of {total}",

    termOf: "Term {i} of {total}",
    viewInMap: "View in map",
    usage: "Usage",
    mentionedIn: "Mentioned in",
    pagerLabel: "Previous and next term",
    previous: "Previous",
    next: "Next",
    notTranslated: "",

    avoidMarker: "Avoid:",

    learnTitle: "Learn step by step",
    learnDescription:
      "Step through all {count} terms in the {site}, with a link diagram for each term and your progress saved.",
    learnCourse: "Course",
    learnOpenCourse: "Open the course list",
    learnCloseCourse: "Close the course list",
    learnProgress: "Progress",
    learnReset: "Reset progress",
    learnResetConfirm: "Clear all your progress in this browser?",
    learnResetConfirmSynced:
      "Clear all the progress of this account, on every device?",
    learnSignIn: "Sign in with Google",
    learnSignInHint: "To sync your progress across devices.",
    learnSigningIn: "Signing in…",
    learnSignInUnavailable: "Google sign-in is not available right now.",
    learnSignInFailed: "Sign-in did not complete.",
    learnSignOut: "Sign out",
    learnSignOutConfirm:
      "Sign out? Synced progress stays in your account. This browser starts again with empty progress.",
    learnSyncing: "Syncing…",
    learnSynced: "Synced",
    learnSyncError: "Sync failed. Retry",
    learnLoading: "Loading the course…",
    learnError: "The course could not load. Reload the page.",
    learnNoScript:
      "This view needs JavaScript. The same terms are in the {link}curriculum list{/link}.",
    learnTermInSection: "Term {i} of {total}",
    learnStepOf: "Step {i} / {total}",
    learnSteps: "{count} steps",
    learnStepsLabel: "Steps",
    learnLinks: "{count} links",
    learnKindDef: "Definition",
    learnKindMore: "Detail",
    learnKindNote: "Note",
    learnKindUsage: "Usage",
    learnKindRecap: "Recap",
    learnKeyIdea: "Key idea",
    learnBack: "Back",
    learnNext: "Next: {label}",
    learnFinished: "End of the course",
    learnHint: "step",
    learnHudOut: "Links to",
    learnHudIn: "Mentioned in",
    learnHudBoth: "Both ways",
    learnToolMap: "3D map",
    learnLegendHit: "mentioned in this step",
    learnLegendSeen: "already mentioned",
    learnLegendAhead: "not yet mentioned",
    learnLegendBoth: "links both ways",
    learnDiagram: "Diagram of the terms “{term}” links to",
    learnNoLinks: "This term links to no other term.",
    learnPrereq: "Good to know first",
    learnPrereqNone: "No earlier term is needed.",
    learnDone: "done",
    learnTermDone: "Finished: {term}",

    tasksNav: "Tasks",
    tasksTitle: "Task board",
    tasksDescription:
      "The open tasks and the decisions of the {site} project, read from GitHub.",
    tasksLede:
      "The tasks and decisions of the project, read from GitHub. Select a task to open its issue.",
    tasksSidebar: "Task filters",
    tasksProject: "Project",
    tasksViews: "View",
    tasksOpen: "Open",
    tasksDoing: "In progress",
    tasksDone: "Done",
    tasksAll: "All",
    tasksLabels: "Labels",
    tasksListTitle: "Tasks",
    tasksAdd: "Add task",
    tasksShare: "Share",
    tasksCopied: "Link copied",
    tasksColTask: "Task name",
    tasksColAssignee: "Assignee",
    tasksColStatus: "Status",
    tasksColUpdated: "Updated",
    tasksUnassigned: "Unassigned",
    tasksComments: "{count} comments",
    tasksEmpty: "No tasks here.",
    tasksEmptyOpen: "No open tasks.",
    tasksEmptyAll: "This repository has no issues on GitHub yet.",
    tasksLoading: "Loading from GitHub…",
    tasksUpdated: "Updated at {time}",
    tasksStale:
      "Could not load new data from GitHub. Showing the copy saved at {time}.",
    tasksError: "Could not load the task list from GitHub.",
    tasksRefresh: "Refresh",
    tasksOnGithub: "View on GitHub",
    tasksNoScript:
      "This page needs JavaScript to load the task list. {link}View the issues on GitHub{/link}.",
    tasksDecisions: "Decisions (ADR)",
    tasksDecisionsLede:
      "Each architecture decision is a file in internal/adr/. A proposed decision is waiting for the owner to choose.",
    tasksPending: "Awaiting decision",
    tasksAdrStatus: {
      proposed: "Proposed",
      accepted: "Accepted",
      rejected: "Rejected",
      superseded: "Superseded",
    },
    tasksLabelNames: {
      bug: "Bug",
      documentation: "Docs",
      enhancement: "Improvement",
      question: "Question",
      "needs-triage": "Needs triage",
      "needs-info": "Needs info",
      "ready-for-agent": "Ready for agent",
      "ready-for-human": "Needs a person",
      wontfix: "Won't do",
    },

    notFoundTitle: "Page not found",
    notFoundDescription: "This page does not exist.",
    notFoundLede: "There is no entry at this address.",
    notFoundHelp:
      "Search for a term above, or browse the {map}map{/map}, the {learn}course{/learn}, the {curriculum}curriculum{/curriculum} or the {az}A–Z list{/az}.",

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
