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
  /** The button on a task that copies a brief to paste into an agent. */
  tasksBrief: string;
  tasksBriefHint: string;
  tasksBriefCopied: string;
  /** The brief itself. "{n}", "{repo}", "{title}", "{url}", "{labels}". */
  tasksBriefIntro: string;
  tasksBriefTitle: string;
  tasksBriefLink: string;
  tasksBriefLabels: string;
  tasksBriefBody: string;
  tasksBriefNoBody: string;
  tasksBriefCut: string;
  tasksBriefStepsTitle: string;
  /** "{n}" is replaced by the number of the issue. */
  tasksBriefSteps: string[];
  tasksPulls: string;
  tasksPullsLede: string;
  /** The label of the number card. */
  tasksPullsWaiting: string;
  tasksPullsEmpty: string;
  tasksPullsReady: string;
  tasksPullsDraft: string;
  /** Between the two branches of a pull request: "from {into} to". */
  tasksPullsInto: string;
  /** "{count}" is replaced by a number. */
  tasksPullsMerged: string;
  tasksPullsAll: string;
  tasksBranches: string;
  tasksBranchesLede: string;
  tasksBranchesCheck: string;
  tasksBranchesChecking: string;
  tasksBranchesNone: string;
  /** "{n}" is replaced by the number of the pull request. */
  tasksBranchesMergedBy: string;
  /** "{count}" is replaced by a number. */
  tasksBranchesOther: string;
  tasksBranchesError: string;
  tasksBranchesManage: string;

  agentsNav: string;
  agentsTitle: string;
  /** "{site}" is replaced by the site name. */
  agentsDescription: string;
  agentsLede: string;
  agentsMcpTitle: string;
  agentsMcpLede: string;
  agentsMcpMore: string;
  agentsConnectTitle: string;
  agentsStatusLabel: string;
  agentsEndpoint: string;
  agentsTransport: string;
  agentsTransportValue: string;
  agentsProtocol: string;
  agentsBodyCap: string;
  agentsRate: string;
  /** "{count}" and "{seconds}" are replaced by numbers. */
  agentsRateValue: string;
  agentsMethods: string;
  agentsLimitsNote: string;
  agentsConnectConfig: string;
  agentsConnectClaude: string;
  agentsStatusChecking: string;
  /** "{count}" is replaced by the number of tools the server lists. */
  agentsStatusOk: string;
  agentsStatusDown: string;
  agentsTryTitle: string;
  agentsTryLede: string;
  agentsTryLabel: string;
  agentsTryPlaceholder: string;
  agentsTryButton: string;
  agentsTryEmpty: string;
  agentsTryError: string;
  agentsTryRaw: string;
  agentsToolsTitle: string;
  /** "{count}" is replaced by the number of tools. */
  agentsToolsLede: string;
  agentsArguments: string;
  agentsRequired: string;
  agentsOptional: string;
  agentsFilesTitle: string;
  agentsFilesLede: string;
  agentsApiTitle: string;
  agentsApiLede: string;
  agentsApiExamples: string;
  agentsApiSpec: string;
  agentsApiNote: string;
  /** What each machine-readable file holds, keyed as MACHINE_FILES in site/build.ts. */
  agentsFiles: Record<string, string>;
  /** "{repo}" and "{upstream}" wrap the linked words. */
  agentsSource: string;
  /**
   * The paragraph under the title of llms.txt. "{count}" and "{sections}" are
   * numbers; "{other}" is the address of the file in the other language.
   */
  llmsIntro: string;
  /** The part of llms.txt that says how an agent connects. */
  llmsConnectTitle: string;
  /**
   * One line per way in: the name of the link, then what it is. The keys are
   * the ones llmsText() in site/build.ts gives an address to. "{example}" is
   * replaced by an address that works.
   */
  llmsConnect: Record<string, [string, string]>;
  llmsToolsTitle: string;
  llmsStartTitle: string;
  llmsStart: string[];
  /** Labels of the lines under an entry in its markdown file. */
  mdPage: string;
  mdLearn: string;
  mdMap: string;
  mdData: string;
  mdNote: string;

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

    tasksBrief: "Chép đề bài",
    tasksBriefHint: "Chép đề bài của task này để dán cho một agent",
    tasksBriefCopied: "Đã chép",
    tasksBriefIntro: "Hãy làm issue #{n} của kho {repo}.",
    tasksBriefTitle: "Tiêu đề: {title}",
    tasksBriefLink: "Liên kết: {url}",
    tasksBriefLabels: "Nhãn: {labels}",
    tasksBriefBody: "Nội dung issue:",
    tasksBriefNoBody: "(Issue này không có nội dung. Chỉ có tiêu đề.)",
    tasksBriefCut: "(Nội dung dài hơn. Đọc phần còn lại ở liên kết trên.)",
    tasksBriefStepsTitle: "Cách làm:",
    tasksBriefSteps: [
      "Đọc AGENTS.md ở gốc kho trước khi sửa. Tệp đó ghi quy tắc của kho và các lệnh kiểm tra phải chạy.",
      'Làm trên một nhánh riêng, rồi mở pull request vào main. Ghi "Closes #{n}" trong mô tả pull request.',
      "Nếu issue thiếu thông tin để làm, hãy hỏi lại thay vì đoán.",
    ],
    tasksPulls: "Pull request",
    tasksPullsLede:
      "Các pull request đang mở của kho. Chọn một dòng để xem và merge trên GitHub.",
    tasksPullsWaiting: "PR chờ merge",
    tasksPullsEmpty: "Không có pull request nào đang mở.",
    tasksPullsReady: "Chờ merge",
    tasksPullsDraft: "Bản nháp",
    tasksPullsInto: "vào",
    tasksPullsMerged: "Đã merge gần đây ({count})",
    tasksPullsAll: "Tất cả pull request",
    tasksBranches: "Nhánh đã merge chưa xoá",
    tasksBranchesLede:
      "Nhánh đã merge hết vào main thì xoá được. Việc xoá làm trên GitHub.",
    tasksBranchesCheck: "Kiểm tra",
    tasksBranchesChecking: "Đang kiểm tra…",
    tasksBranchesNone: "Không còn nhánh nào đã merge mà chưa xoá.",
    tasksBranchesMergedBy: "đã merge qua #{n}",
    tasksBranchesOther:
      "{count} nhánh khác chưa merge hết, hoặc chưa có pull request.",
    tasksBranchesError: "Không tải được danh sách nhánh từ GitHub.",
    tasksBranchesManage: "Quản lý nhánh trên GitHub",

    agentsNav: "AI agent",
    agentsTitle: "Dành cho AI agent",
    agentsDescription:
      "Cách để AI agent đọc {site}: máy chủ MCP, HTTP API và các tệp cho máy đọc.",
    agentsLede:
      "Toàn bộ từ điển có ở dạng dữ liệu. Agent có thể hỏi qua Model Context Protocol, gọi HTTP API, hoặc đọc các tệp.",
    agentsMcpTitle: "Máy chủ MCP",
    agentsMcpLede:
      "Máy chủ chỉ đọc và không cần đăng nhập. Mỗi yêu cầu là độc lập, máy chủ không giữ phiên.",
    agentsMcpMore: "Cách kết nối và danh sách công cụ",
    agentsConnectTitle: "Kết nối",
    agentsStatusLabel: "Trạng thái",
    agentsEndpoint: "Địa chỉ",
    agentsTransport: "Cách truyền",
    agentsTransportValue: "Streamable HTTP, không lưu trạng thái",
    agentsProtocol: "Phiên bản MCP",
    agentsBodyCap: "Thân yêu cầu tối đa",
    agentsRate: "Giới hạn tần suất",
    agentsRateValue: "{count} yêu cầu mỗi {seconds} giây, tính theo địa chỉ IP",
    agentsMethods: "Phương thức HTTP",
    agentsLimitsNote:
      "Vượt giới hạn tần suất thì nhận 429 kèm Retry-After. Thân yêu cầu quá lớn thì nhận 413. Phương thức khác POST và OPTIONS thì nhận 405 kèm địa chỉ trang này.",
    agentsConnectConfig: "Thêm vào cấu hình MCP của ứng dụng:",
    agentsConnectClaude: "Hoặc với Claude Code:",
    agentsStatusChecking: "Đang kiểm tra máy chủ…",
    agentsStatusOk: "Máy chủ đang trả lời: {count} công cụ.",
    agentsStatusDown: "Máy chủ MCP không trả lời ở địa chỉ này.",
    agentsTryTitle: "Thử ngay",
    agentsTryLede:
      "Ô này gọi công cụ search của máy chủ, đúng như một agent sẽ gọi.",
    agentsTryLabel: "Từ cần tìm",
    agentsTryPlaceholder: "ví dụ: cửa sổ ngữ cảnh",
    agentsTryButton: "Tìm",
    agentsTryEmpty: "Không có thuật ngữ nào khớp.",
    agentsTryError: "Máy chủ MCP không trả lời.",
    agentsTryRaw: "Xem JSON máy chủ trả về",
    agentsToolsTitle: "Công cụ",
    agentsToolsLede:
      "{count} công cụ, liệt kê từ chính danh sách mà máy chủ khai báo. Mô tả bằng tiếng Anh vì đó là nguyên văn agent nhận được.",
    agentsArguments: "Tham số",
    agentsRequired: "bắt buộc",
    agentsOptional: "tuỳ chọn",
    agentsFilesTitle: "Tệp cho máy đọc",
    agentsFilesLede:
      "Cùng nội dung đó ở dạng tệp tĩnh, cho agent không dùng MCP. Danh sách này lấy từ các tệp mà bản dựng vừa ghi ra.",
    agentsApiTitle: "HTTP API",
    agentsApiLede:
      "Cùng các công cụ của máy chủ MCP, gọi bằng GET hoặc POST thông thường. Dành cho agent không nói MCP. Kết quả là JSON.",
    agentsApiExamples: "Mỗi công cụ một địa chỉ. Các ví dụ dưới đây chạy được:",
    agentsApiSpec: "Mô tả OpenAPI",
    agentsApiNote:
      "Với GET, tham số nằm trong địa chỉ; danh sách thì viết các giá trị cách nhau bằng dấu phẩy. Với POST, gửi một đối tượng JSON chứa các tham số đó. API dùng chung giới hạn tần suất với máy chủ MCP.",
    agentsFiles: {
      llms: "Mỗi thuật ngữ một dòng, theo thứ tự giáo trình. Tiếng Việt.",
      llms_en: "Như trên, tiếng Anh.",
      llms_full:
        "Toàn bộ nội dung của mọi thuật ngữ trong một tệp. Tiếng Việt.",
      llms_full_en: "Như trên, tiếng Anh.",
      index: "Danh sách mọi thuật ngữ với mô tả và địa chỉ, cả hai ngôn ngữ.",
      term: "Một thuật ngữ: nội dung hai ngôn ngữ, các liên kết đi và đến.",
      graph: "Các thuật ngữ và liên kết giữa chúng, để đi theo liên kết.",
      corpus: "Toàn bộ dữ liệu trong một tệp. Máy chủ MCP trả lời từ tệp này.",
      sitemap: "Mọi trang của website, ở cả hai ngôn ngữ.",
      robots: "Quy tắc thu thập và địa chỉ sitemap.",
      markdown:
        "Một thuật ngữ ở dạng markdown: thêm .md vào địa chỉ trang. Tiếng Việt.",
      markdown_en: "Như trên, tiếng Anh.",
      openapi: "Mô tả OpenAPI 3.1 của HTTP API.",
      server_card:
        "Thẻ máy chủ MCP: địa chỉ, cách truyền và khả năng, để ứng dụng tự tìm ra máy chủ.",
      skills: "Danh sách agent skill mà website công bố.",
      skill:
        "Agent skill: hướng dẫn agent khi nào và cách nào dùng từ điển này.",
    },
    agentsSource:
      "Mã nguồn và nội dung nằm ở {repo}kho của dự án{/repo}. Các mục tiếng Anh lấy từ {upstream}kho gốc{/upstream}.",
    llmsIntro:
      "{count} thuật ngữ về lập trình với AI, trong {sections} phần, theo thứ tự giáo trình. Mỗi thuật ngữ có bản tiếng Việt và tiếng Anh. English: {other}.",
    llmsConnectTitle: "Kết nối agent (chỉ đọc, không cần đăng nhập)",
    llmsConnect: {
      mcp: [
        "Máy chủ MCP",
        "Streamable HTTP, không lưu trạng thái. Thêm địa chỉ này làm máy chủ MCP từ xa.",
      ],
      api: [
        "HTTP API",
        "Cùng các công cụ đó qua GET hoặc POST, trả JSON. Ví dụ: {example}",
      ],
      openapi: ["OpenAPI 3.1", "Mô tả của HTTP API."],
      markdown: [
        "Markdown của một thuật ngữ",
        "Thêm .md vào địa chỉ trang của thuật ngữ bất kỳ.",
      ],
      full: ["Toàn bộ nội dung", "Mọi thuật ngữ trong một tệp. Tệp lớn."],
      index: ["Dữ liệu JSON", "Danh sách mọi thuật ngữ, cả hai ngôn ngữ."],
      skills: [
        "Agent skill",
        "Hướng dẫn khi nào và cách nào dùng các công cụ này.",
      ],
      card: ["Thẻ máy chủ MCP", "Để ứng dụng tự tìm ra máy chủ."],
      guide: ["Hướng dẫn kết nối", "Trang cho người đọc."],
    },
    llmsToolsTitle: "Công cụ",
    llmsStartTitle: "Bắt đầu từ đâu",
    llmsStart: [
      "Có câu hỏi hoặc từ khoá mà chưa có slug: gọi search, rồi get_term với slug trong kết quả.",
      "Đã có tên thuật ngữ: gọi get_term. Tên tiếng Anh, tên tiếng Việt hay slug đều được.",
      'Câu hỏi dạng "X khác Y thế nào": gọi compare.',
      "Muốn mở rộng câu trả lời: gọi get_related để đi theo liên kết từ một thuật ngữ.",
      'Tìm kiếm khớp theo từ, không theo nghĩa. Nếu kết quả không dùng được, tìm lại bằng danh từ chính. Truyền lang là "vi" hoặc "en".',
      "Ghi url của mỗi thuật ngữ đã dùng. Khi người dùng muốn học một thuật ngữ, đưa learn_url; muốn xem nó nối với gì, đưa map_url.",
    ],
    mdPage: "Trang",
    mdLearn: "Học từng bước",
    mdMap: "Trên bản đồ",
    mdData: "JSON",
    mdNote:
      "Trang nào của thuật ngữ cũng có bản markdown: thêm .md vào địa chỉ.",

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

    tasksBrief: "Copy brief",
    tasksBriefHint: "Copy a brief of this task to paste into an agent",
    tasksBriefCopied: "Copied",
    tasksBriefIntro: "Work on issue #{n} of the repository {repo}.",
    tasksBriefTitle: "Title: {title}",
    tasksBriefLink: "Link: {url}",
    tasksBriefLabels: "Labels: {labels}",
    tasksBriefBody: "The issue says:",
    tasksBriefNoBody: "(This issue has no text. It has only a title.)",
    tasksBriefCut: "(The text goes on. Read the rest at the link above.)",
    tasksBriefStepsTitle: "How to work:",
    tasksBriefSteps: [
      "Read AGENTS.md at the repository root before you change anything. It has the rules of the repository and the checks to run.",
      'Work on a branch of its own, then open a pull request into main. Write "Closes #{n}" in the description of the pull request.',
      "If the issue does not say enough to do the work, ask instead of guessing.",
    ],
    tasksPulls: "Pull requests",
    tasksPullsLede:
      "The open pull requests of the repository. Select one to review and merge it on GitHub.",
    tasksPullsWaiting: "PRs to merge",
    tasksPullsEmpty: "No open pull requests.",
    tasksPullsReady: "Ready to merge",
    tasksPullsDraft: "Draft",
    tasksPullsInto: "into",
    tasksPullsMerged: "Merged recently ({count})",
    tasksPullsAll: "All pull requests",
    tasksBranches: "Merged branches not yet deleted",
    tasksBranchesLede:
      "A branch that is fully merged into main can be deleted. Deleting is done on GitHub.",
    tasksBranchesCheck: "Check",
    tasksBranchesChecking: "Checking…",
    tasksBranchesNone: "No merged branch is left to delete.",
    tasksBranchesMergedBy: "merged by #{n}",
    tasksBranchesOther:
      "{count} other branches are not fully merged, or have no pull request.",
    tasksBranchesError: "Could not load the branch list from GitHub.",
    tasksBranchesManage: "Manage branches on GitHub",

    agentsNav: "AI agents",
    agentsTitle: "For AI agents",
    agentsDescription:
      "How an AI agent can read the {site}: the MCP server, the HTTP API and the machine-readable files.",
    agentsLede:
      "The whole dictionary is available as data. An agent can query it over the Model Context Protocol, call the HTTP API, or read it as files.",
    agentsMcpTitle: "MCP server",
    agentsMcpLede:
      "The server only reads and needs no sign-in. Each request stands alone: the server keeps no session.",
    agentsMcpMore: "How to connect, and the list of tools",
    agentsConnectTitle: "Connect",
    agentsStatusLabel: "Status",
    agentsEndpoint: "Address",
    agentsTransport: "Transport",
    agentsTransportValue: "Streamable HTTP, stateless",
    agentsProtocol: "MCP versions",
    agentsBodyCap: "Largest request body",
    agentsRate: "Rate limit",
    agentsRateValue: "{count} requests per {seconds} seconds, per IP address",
    agentsMethods: "HTTP methods",
    agentsLimitsNote:
      "A caller over the rate limit receives 429 with Retry-After. A body over the cap receives 413. Any method other than POST and OPTIONS receives 405 with the address of this page.",
    agentsConnectConfig: "Add this to the MCP configuration of your client:",
    agentsConnectClaude: "Or with Claude Code:",
    agentsStatusChecking: "Checking the server…",
    agentsStatusOk: "The server is answering: {count} tools.",
    agentsStatusDown: "The MCP server does not answer at this address.",
    agentsTryTitle: "Try it",
    agentsTryLede:
      "This box calls the server's search tool, the way an agent would.",
    agentsTryLabel: "Words to look for",
    agentsTryPlaceholder: "for example: context window",
    agentsTryButton: "Search",
    agentsTryEmpty: "No term matches.",
    agentsTryError: "The MCP server did not answer.",
    agentsTryRaw: "Show the JSON the server returned",
    agentsToolsTitle: "Tools",
    agentsToolsLede:
      "{count} tools, listed from the registry the server itself declares.",
    agentsArguments: "Arguments",
    agentsRequired: "required",
    agentsOptional: "optional",
    agentsFilesTitle: "Machine-readable files",
    agentsFilesLede:
      "The same content as static files, for agents that do not use MCP. This list comes from the files the build has just written.",
    agentsApiTitle: "HTTP API",
    agentsApiLede:
      "The tools of the MCP server again, called with a plain GET or POST. For an agent that does not speak MCP. The answer is JSON.",
    agentsApiExamples: "Each tool has an address. These examples work:",
    agentsApiSpec: "OpenAPI description",
    agentsApiNote:
      "In a GET the parameters go in the address; write a list as values with commas between them. In a POST, send a JSON object of the same parameters. The API shares the rate limit of the MCP server.",
    agentsFiles: {
      llms: "Every term on one line, in teaching order. Vietnamese.",
      llms_en: "The same, in English.",
      llms_full: "The full text of every term in one file. Vietnamese.",
      llms_full_en: "The same, in English.",
      index:
        "Every term with its description and addresses, in both languages.",
      term: "One term: its text in both languages, and its links in and out.",
      graph: "The terms and the links between them, for following links.",
      corpus: "All the data in one file. The MCP server answers from it.",
      sitemap: "Every page of the site, in both languages.",
      robots: "Crawl rules and the address of the sitemap.",
      markdown:
        "One term as markdown: add .md to the address of its page. Vietnamese.",
      markdown_en: "The same, in English.",
      openapi: "The OpenAPI 3.1 description of the HTTP API.",
      server_card:
        "The MCP server card: address, transport and capabilities, so a client can find the server by itself.",
      skills: "The list of agent skills this site publishes.",
      skill:
        "The agent skill: tells an agent when and how to use this dictionary.",
    },
    agentsSource:
      "The code and the content are in {repo}the project's repository{/repo}. The English entries come from {upstream}the upstream repository{/upstream}.",
    llmsIntro:
      "{count} terms of coding with AI, in {sections} sections, in teaching order. Every term has an English and a Vietnamese text. Tiếng Việt: {other}.",
    llmsConnectTitle: "Connect an agent (read-only, no sign-in)",
    llmsConnect: {
      mcp: [
        "MCP server",
        "Streamable HTTP, stateless. Add this address as a remote MCP server.",
      ],
      api: [
        "HTTP API",
        "The same tools over GET or POST, answering JSON. Example: {example}",
      ],
      openapi: ["OpenAPI 3.1", "The description of the HTTP API."],
      markdown: [
        "Markdown of one term",
        "Add .md to the address of any term's page.",
      ],
      full: ["Full text", "Every term in one file. The file is large."],
      index: ["JSON data", "The list of every term, in both languages."],
      skills: ["Agent skill", "Says when and how to use these tools."],
      card: ["MCP server card", "Lets a client find the server by itself."],
      guide: ["How to connect", "The page for people."],
    },
    llmsToolsTitle: "Tools",
    llmsStartTitle: "Start here",
    llmsStart: [
      "A question or keywords, and no slug: call search, then get_term with a slug from the results.",
      "The name of a term: call get_term. The English term, its Vietnamese name and its slug all work.",
      'A question of the form "how does X differ from Y": call compare.',
      "To widen an answer: call get_related to follow the links from a term.",
      'Search matches words, not meaning. If the results are no use, search again with the key noun. Pass lang as "vi" or "en".',
      "Cite the url of each term you use. When the user wants to study a term, give learn_url; to see what it connects to, give map_url.",
    ],
    mdPage: "Page",
    mdLearn: "Learn step by step",
    mdMap: "On the map",
    mdData: "JSON",
    mdNote: "Every term page has a markdown copy: add .md to its address.",

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
