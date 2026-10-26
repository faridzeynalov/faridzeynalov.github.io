import type { SiteContent } from "@/content/types";

const AZ_EN_RU = "Azərbaycan, ingilis və rus dillərində versiyalar";
const AZ_EN = "Azərbaycan və ingilis dillərində versiyalar";

/** Shared by the hotel sites built on the same booking platform. */
const HOTEL = [
  "Gəliş/gediş tarixləri, otaqlar, qonaqlar və promo kod ilə əsas ekranda rezervasiya paneli",
  "Əsas ekranda otelin yerləşdiyi məkan üçün canlı yerli vaxt və hava",
  "Şəkil karuselləri ilə otaq və suit siyahıları",
  AZ_EN_RU,
];

/** Azerbaijani content. Mirrors en.ts. */
export const az: SiteContent = {
  profile: {
    role: "Front-End Developer",
    location: "Bakı, Azərbaycan",
    present: "Hazırda",
    summary:
      "4 ildən artıq kommersiya təcrübəsi olan front-end developer. React, Next.js və TypeScript ilə sürətli və responsiv veb tətbiqlər hazırlayıram; 25-dən çox veb sayt və platformanı istifadəyə vermişəm.",
    about: [
      "4 ildən artıq kommersiya təcrübəsi olan front-end developerəm. 2022-ci ildən One Studio-da qonaqpərvərlik, daşınmaz əmlak, səhiyyə, təhsil və e-ticarət sahələri üçün 25-dən çox veb sayt və platforma hazırlayıb istifadəyə vermişəm — korporativ saytlardan Tabia Group Hotels-in otel portfelinə qədər.",
      "Əsas texnologiyalarım JavaScript (ES6+), TypeScript, React, Next.js (App Router) və Tailwind CSS-dir. State idarəetməsi üçün Redux Toolkit, RTK Query və Zustand-dan istifadə edir, REST və GraphQL API-lərini inteqrasiya edir, komponentləri Jest və React Testing Library ilə test edirəm. Köhnə markup-ı bir neçə layihədə istifadə olunan, təkrar istifadəyə yararlı komponent sistemləri ilə əvəz edirəm.",
      "SEO və performans optimallaşdırmasına (code splitting, lazy loading, şəkil optimallaşdırması), brauzerlərarası uyğunluğa və təmiz, asan dəstəklənən koda xüsusi diqqət yetirirəm. Biznes üçün kritik olan canlı saytları trafikə təsir etmədən dəstəkləyir, dizaynerlər, backend mühəndisləri və müştərilərlə birbaşa işləyirəm. Hazırda daha böyük və mürəkkəb funksionallığa cavabdeh olacağım front-end developer vəzifəsi axtarıram.",
    ],
    industries: ["Qonaqpərvərlik", "Daşınmaz əmlak", "Səhiyyə", "Təhsil", "E-ticarət"],
    cv: {
      title: "Front-End Developer (React / Next.js)",
      summary:
        "JavaScript, TypeScript, React və Next.js ilə responsiv və yüksək performanslı veb tətbiqlərin hazırlanmasında 4 ildən artıq kommersiya təcrübəsinə malik Front-End Developer. Qonaqpərvərlik, daşınmaz əmlak, səhiyyə, təhsil və e-ticarət sahələrində 25-dən çox veb sayt və platformanı istifadəyə vermişəm: RESTful API inteqrasiyası və komponent əsaslı arxitekturadan SEO və performans optimallaşdırmasına qədər. State management (Redux Toolkit, RTK Query) və təmiz, təkrar istifadə olunan, asan dəstəklənən kod yazmaq güclü tərəflərimdəndir. React/Next.js üzrə təcrübəmi dərinləşdirəcəyim və daha böyük, mürəkkəb funksionallığa cavabdeh olacağım Front-End Developer vəzifəsi axtarıram.",
    },
    skills: [
      {
        title: "Dillər və markup",
        description: "Bütün işin təməli.",
        items: ["JavaScript (ES6+)", "TypeScript", "HTML5", "CSS3"],
      },
      {
        title: "Framework və kitabxanalar",
        description:
          "Proqnozlaşdırılan state idarəetməsi və data sorğuları ilə komponent əsaslı tətbiqlər.",
        items: [
          "React",
          "Next.js (App Router)",
          "Redux Toolkit",
          "RTK Query",
          "Zustand",
          "Tailwind CSS",
        ],
      },
      {
        title: "Test",
        description: "Komponentlərin istifadəyə verilməzdən əvvəl etibarlı işləməsi üçün.",
        items: ["Jest", "React Testing Library"],
      },
      {
        title: "Alətlər və təcrübələr",
        description: "İşin necə təhvil verildiyi və keyfiyyətinin necə qorunduğu.",
        items: [
          "Git",
          "Docker",
          "REST API inteqrasiyası",
          "GraphQL",
          "Responsiv dizayn",
          "SEO",
          "Performans optimallaşdırması",
          "Brauzerlərarası uyğunluq",
          "Komponent əsaslı arxitektura",
        ],
      },
    ],
    experience: [
      {
        role: "Front-End Developer",
        location: "Bakı, Azərbaycan",
        highlights: [
          "Qonaqpərvərlik, daşınmaz əmlak, səhiyyə, təhsil və e-ticarət sahələrində 25-dən çox real veb sayt və veb tətbiq hazırlayıb istifadəyə vermişəm — Tabia Group Hotels portfeli də daxil olmaqla.",
          "React, Next.js, TypeScript və Tailwind CSS ilə responsiv interfeyslər hazırlamış, köhnə markup-ı bir neçə müştəri layihəsində istifadə olunan, təkrar istifadəyə yararlı komponent sistemləri ilə əvəz etmişəm.",
          "Dinamik kontent, rezervasiya sistemləri və interaktiv platformalar üçün RESTful API-ləri inteqrasiya etmişəm.",
          "SEO üzrə ən yaxşı təcrübələri və performans optimallaşdırmalarını tətbiq etmişəm: code splitting, lazy loading, şəkil optimallaşdırması.",
          "Biznes üçün kritik olan canlı tətbiqləri istifadəçi trafikinə təsir etmədən dəstəkləmiş və genişləndirmişəm.",
          "Biznes tələblərini texniki həllərə çevirmək üçün dizaynerlər, backend mühəndisləri və müştərilərlə birbaşa işləmişəm.",
        ],
      },
    ],
    education: [
      {
        degree: "Magistr dərəcəsi",
        field: "Kompüter elmləri — Kompüter sistemləri və şəbəkələrinin proqram təminatı",
        institution: "Azərbaycan Texniki Universiteti",
      },
      {
        degree: "Bakalavr dərəcəsi",
        field: "Kompüter mühəndisliyi",
        institution: "Azərbaycan Texniki Universiteti",
      },
    ],
    languages: [
      { name: "İngilis dili", level: "Səlis" },
      { name: "Azərbaycan dili", level: "Ana dili" },
      { name: "Türk dili", level: "Səlis" },
      { name: "Rus dili", level: "Başlanğıc səviyyə" },
    ],
    certificates: [{ name: "IELTS 7.0", period: "2019 – 2021" }],
  },
  services: {
    frontend: {
      title: "Front-end proqramlaşdırma",
      tagline: "React, Next.js və TypeScript",
      description:
        "React, Next.js və TypeScript ilə hazırlanmış, istifadəyə hazır veb saytlar və veb tətbiqlər. Sürətli, əlçatan və buraxılışdan uzun müddət sonra da komandanızın asanlıqla genişləndirə biləcəyi təmiz, komponent əsaslı kod.",
      deliverables: [
        "React və Next.js (App Router) tətbiqləri",
        "Təkrar istifadə oluna bilən, ciddi tipləşdirilmiş komponent sistemləri",
        "Redux Toolkit, RTK Query və ya Zustand ilə state management",
        "Pikselinə qədər dəqiq, responsiv və brauzerlərarası düzülüşlər",
      ],
    },
    design: {
      title: "UI dizayn və dizayn sistemləri",
      tagline: "Məqsədyönlü interfeyslər",
      description:
        "Səliqəli görünən və istifadəsi rahat olan interfeyslər. İlkin ideyaları və ya mövcud dizaynları vahid vizual dilə çevirirəm: boşluqlar, tipoqrafiya, rənglər və hər interaktiv vəziyyət dəqiq işlənir.",
      deliverables: [
        "UI konseptləri, səhifə düzülüşləri və responsiv variantlar",
        "Dizayn tokenləri və komponent kitabxanaları",
        "Diqqəti yayındırmayan, yol göstərən animasiya və mikro-interaksiyalar",
        "Əlçatan rəng, kontrast və fokus vəziyyətləri",
      ],
    },
    seo: {
      title: "SEO və performans",
      tagline: "Sürətli, görünən, ölçülə bilən",
      description:
        "Tez yüklənən və axtarışda asan tapılan saytlar. Texniki SEO və performans sonradan əlavə edilmir — ilk gündən layihənin bir hissəsidir. Nəticədə həm axtarış sistemləri, həm də istifadəçilər sürətli sayt görür.",
      deliverables: [
        "Texniki SEO: metadata, sitemap, Open Graph, semantik HTML",
        "Core Web Vitals və Lighthouse optimallaşdırması",
        "Code splitting, lazy loading və şəkil optimallaşdırması",
        "Statik generasiya və keşləmə strategiyaları",
      ],
    },
    ai: {
      title: "AI inteqrasiyası",
      tagline: "Məhsulunuzda praktik AI",
      description:
        "İstifadəçilərinizin həqiqətən faydalanacağı AI funksiyaları: müasir LLM API-lərinə qoşulmuş assistentlər, ağıllı axtarış və kontent alətləri. Streaming, aydın yüklənmə vəziyyətləri və etibarlı ehtiyat həllər sayəsində sürətli və etibarlı işləyir.",
      deliverables: [
        "Axınla (streaming) cavab verən chat və assistent interfeysləri",
        "LLM API inteqrasiyası (OpenAI, Anthropic)",
        "AI əsaslı axtarış, xülasə və kontent alətləri",
        "Strukturlaşdırılmış, yoxlanılmış nəticə verən prompt dizaynı",
      ],
    },
    integrations: {
      title: "API-lər və veb tətbiqlər",
      tagline: "Real data ilə işləyən",
      description:
        "Real data ilə işləyən dinamik məhsullar: REST və ya GraphQL API-lərinə qoşulmuş rezervasiya axınları, kataloqlar, idarəetmə panelləri və formalar — hər addımda düzgün yüklənmə, boş və xəta vəziyyətləri ilə.",
      deliverables: [
        "REST və GraphQL API inteqrasiyası",
        "Rezervasiya sistemləri, məhsul kataloqları və filtrlər",
        "Formalar, validasiya və xətaların idarə olunması",
        "Çoxdilli saytlar (Azərbaycan, ingilis, rus)",
      ],
    },
    maintenance: {
      title: "Dəstək və optimallaşdırma",
      tagline: "Canlı məhsulların dəstəyi",
      description:
        "Biznes üçün kritik olan canlı saytlara davamlı dəstək. Yeni funksiyalar, düzəlişlər və performans təkmilləşdirmələri saytın trafikinə və müştərilərinə təsir etmədən, diqqətlə tətbiq olunur.",
      deliverables: [
        "Mövcud kod bazalarında yeni funksiyaların hazırlanması",
        "Xətaların düzəldilməsi, brauzer və cihaz üzrə yoxlama (QA)",
        "Köhnə markup-ın müasir komponentlərə köçürülməsi",
        "Asılılıqların yenilənməsi və kod auditi",
      ],
    },
  },
  process: [
    {
      title: "Kəşf",
      description:
        "Məqsədləri, auditoriyanı və məhdudiyyətləri müzakirə edirik. Mövcud dizaynları, kontenti və kodu nəzərdən keçirir, sonra əhatə dairəsi, prioritetlər və müddət barədə razılaşırıq.",
    },
    {
      title: "Dizayn",
      description:
        "Səhifə düzülüşləri, komponentlər və hər interaktiv vəziyyət sizin və ya mənim dizayn fayllarımda müəyyənləşdirilir; responsiv davranış və əlçatanlıq əvvəlcədən nəzərə alınır.",
    },
    {
      title: "Hazırlama",
      description:
        "Tipləşdirilmiş, komponent əsaslı kod və müntəzəm önbaxışlar: irəliləyişi erkən görür, detallar yekunlaşmadan istiqaməti dəyişə bilirsiniz.",
    },
    {
      title: "Buraxılış və dəstək",
      description:
        "Buraxılışdan əvvəl performans, SEO və brauzer uyğunluğu yoxlanılır; sonra isə məhsul böyüdükcə təkmilləşdirmələr, düzəlişlər və yeni funksiyalar gəlir.",
    },
  ],
  ai: {
    intro:
      "AI alətlərindən hər gün prototip hazırlamaq, kodu refaktorinq etmək və test yazmaq üçün istifadə edirəm, hazırladığım interfeyslərə də AI funksiyaları əlavə edirəm. Qərarlar, yoxlama və yekun keyfiyyət isə həmişə mənim məsuliyyətimdədir.",
    capabilities: [
      {
        title: "AI dəstəkli proqramlaşdırma",
        description:
          "Komponentlərin ilkin strukturunu qurmaq, köhnə kodu refaktor etmək, testlər yazmaq və dəyişiklikləri nəzərdən keçirmək üçün AI kodlaşdırma assistentləri ilə işləyirəm — hər sətir buraxılışdan əvvəl yoxlanılır.",
      },
      {
        title: "LLM inteqrasiyası",
        description:
          "Front-end-i böyük dil modeli API-lərinə qoşuram: açarları təhlükəsiz saxlayan server sorğuları, axınla gələn cavablar, təkrar cəhdlər, limitlər və etibarlı ehtiyat həllər.",
      },
      {
        title: "Söhbət interfeysləri",
        description:
          "Sürətli hiss olunan chat və assistent interfeysləri — axınla gələn tokenlər, ləğvetmə, mesaj tarixçəsi, Markdown göstərilməsi və tam klaviatura əlçatanlığı.",
      },
      {
        title: "Prompt mühəndisliyi",
        description:
          "Strukturlaşdırılmış promptlar və sistem təlimatları, sxemə görə yoxlanılan JSON nəticə və AI funksiyalarının production-da proqnozlaşdırıla bilən işləməsi üçün cavabların test edilməsi.",
      },
    ],
    skills: [
      "AI dəstəkli proqramlaşdırma",
      "LLM API inteqrasiyası",
      "Söhbət interfeysləri",
      "Prompt mühəndisliyi",
    ],
  },
  principles: [
    {
      title: "Təmiz, təkrar istifadə oluna bilən kod",
      text: "Komandaların oxuya, təkrar istifadə edə və genişləndirə biləcəyi komponent əsaslı arxitektura: birdəfəlik markup-ı layihədən layihəyə miqyaslanan sistemlərlə əvəz edirəm.",
    },
    {
      title: "Sürət və SEO ilk gündən",
      text: "Performans və SEO sonradan düşünülən məsələ deyil, işin ayrılmaz hissəsidir: code splitting, lazy loading, optimallaşdırılmış şəkillər və düzgün metadata.",
    },
    {
      title: "Sıx əməkdaşlıq",
      text: "Biznes tələblərini işlək məhsullara çevirmək üçün dizaynerlər, backend mühəndisləri və müştərilərlə birbaşa işləyirəm.",
    },
  ],
  industries: {
    hospitality: "Qonaqpərvərlik",
    "real-estate": "Daşınmaz əmlak",
    healthcare: "Səhiyyə",
    "e-commerce": "E-ticarət",
    corporate: "Korporativ və sənaye",
    education: "Təhsil",
  },
  projects: {
    panorama: {
      summary: "Yüksək moda brendini sahil həyatı ilə birləşdirən dənizkənarı yaşayış konsepti.",
      overview:
        "Panorama by ELIE SAAB üçün marketinq saytı — dəniz mənzərəsi və moda evinin dizayn dili ətrafında qurulmuş yaşayış layihəsi. Sayt ziyarətçiləri rezidensiyalar və ərazidəki infrastrukturla tanış edir, marağı müraciətlərə və broşür yükləmələrinə çevirir.",
      liveFeatures: [
        "Tam enli memarlıq görüntüləri ilə rezidensiyalar və infrastruktur bölmələri",
        "Header-də müraciət düyməsi və yüklənə bilən broşür",
        "Header-də açıq/qaranlıq rejim keçidi",
        AZ_EN_RU,
      ],
    },
    "garabagh-resort": {
      summary: "Müalicə və rezervasiya ətrafında qurulmuş Naftalan sağlamlıq otelinin saytı.",
      overview:
        "Naftalandakı Garabagh Resort & SPA otel qonaqlığını şəhərin məşhur Naftalan nefti müalicəsi ilə birləşdirir. Sayt yaşayış, müalicə proqramları, tibbi paketlər, SPA və restoranları təqdim edir; rezervasiya ilk ekrandan mümkündür.",
      liveFeatures: [...HOTEL, "Naftalan müalicəsi və tibbi paketlər üçün ayrıca bölmələr"],
    },
    "24k": {
      summary:
        "Kateqoriyalar, məhsul siyahıları və mağaza ünvanları ilə onlayn zərgərlik kataloqu.",
      overview:
        "24K.az zərgərlik satıcısının onlayn kataloqudur. Alıcılar dəstlərə, boyunbağılara, sırğalara, qolbaqlara, üzüklərə, broşlara və qızıl külçələrə baxa, qiymətləri görə və brendin fiziki mağazalarını tapa bilirlər.",
      liveFeatures: [
        "Bütün zərgərlik çeşidi üçün kateqoriya naviqasiyası",
        "Qiymətlər və istək siyahısı düyməsi ilə məhsul şəbəkəsi",
        "Kataloqda axtarış",
        "Mağaza və ticarət mərkəzi ünvanları, bloq və dəstək səhifələri",
        AZ_EN_RU,
      ],
    },
    "vien-group": {
      summary: "Dəniz və sənaye tikintisi şirkəti üçün korporativ sayt.",
      overview:
        "VIEN Group Azərbaycanda və Səudiyyə Ərəbistanında fəaliyyət göstərən tikinti şirkətidir; gəmi layihələndirilməsi, polad konstruksiyalar, metal emalı və enerji həlləri ilə məşğul olur. Sayt sənaye müştərilərinə şirkətin xidmətlərini, layihə portfelini və tərəfdaşlarını təqdim edir.",
      liveFeatures: [
        "Sənaye fotoşəkilləri üzərində serif tipoqrafiyalı, redaksiya üslublu əsas ekran",
        "Xidmətlər icmalı: dəniz sənayesi həlləri, inşaat işləri, metal emalı, enerji və təmir",
        "Layihələr, tərəfdaşlar və bloq bölmələri",
      ],
    },
    excelsior: {
      summary:
        "Bakıda beşulduzlu şəhər oteli — birbaşa rezervasiya ilə otaqlar, tədbirlər, wellness və restoranlar.",
      overview:
        "Excelsior Hotel & SPA Bakının mərkəzində yerləşən beşulduzlu oteldir. Sayt yaşayış, görüş və tədbirlər, Aura Wellness Center və restoranları əhatə edir, əsas ekranda rezervasiya paneli var.",
      liveFeatures: [...HOTEL, "Görüş və tədbirlər, wellness mərkəzi bölmələri"],
    },
    "tabia-group": {
      summary: "Qonaqpərvərlik qrupunun otel və kurortları üçün ümumi brend saytı.",
      overview:
        "Azərbaycanda otel və kurortlar portfelini idarə edən TABIA Group-un korporativ saytı. Sayt qrupun qonaqpərvərlik brendlərini, gələcək layihələrini və xəbərlərini təqdim edir, rezervasiyaya keçid verir.",
      liveFeatures: [
        "Geniş display tipoqrafiyalı, tam ekran redaksiya üslublu əsas ekran",
        "Gələcək layihələr və xəbərlər bölmələri",
        "Header-də rezervasiya keçidi",
        AZ_EN_RU,
      ],
    },
    yashamal: {
      summary: "İnteraktiv baş plan və mərtəbə planları olan şəhər yaşayış kompleksi.",
      overview:
        "YAŞAMAL — Azadlıq Residence-in şəhər yaşayış layihəsi. Sayt rezidensiyaları, mərtəbə planlarını, baş planı və ərazidəki imkanları təqdim edir, ziyarətçilərə kataloqu yükləmək və ya müraciət göndərmək imkanı verir.",
      liveFeatures: [
        "İşarələnmiş bloklarla baş plan görünüşü",
        "Rezidensiyalar, mərtəbə planları və imkanlar bölmələri",
        "Kataloq yükləmə və müraciət forması keçidləri",
        "Açıq/qaranlıq rejim keçidi, Azərbaycan, ingilis və rus dillərində versiyalar",
      ],
    },
    badamdar: {
      summary:
        "Bakıda otaqlar, ofislər, tədbirlər və restoranlarla otel və servisli rezidensiyalar.",
      overview:
        "Badamdar Hotel & Residences oteli rezidensiyalar və ofis sahələri ilə birləşdirir. Sayt otaqları, rezidensiya və ofisləri, görüş və tədbirləri, SPA və fitnesi, restoranları təqdim edir.",
      liveFeatures: [...HOTEL, "Otel otaqları ilə yanaşı rezidensiya və ofislər bölməsi"],
    },
    "sky-breeze": {
      summary: "Şahdağ kurortunda premium dağ rezidensiyaları və villalar.",
      overview:
        "Sky Breeze Şahdağ dağ kurortunda həm yaşamaq, həm də investisiya üçün mənzillər və villalar təklif edən yaşayış layihəsidir. Sayt layihəni, yerləşməni, memarlığı, investisiya imkanlarını və qalereyanı əhatə edir.",
      liveFeatures: [
        "Uzun formatlı hekayə bölmələri: layihə, yerləşmə, memarlıq, investisiya",
        "Qalereya və daxil edilmiş audio/video kontent",
        AZ_EN_RU,
      ],
    },
    "merkezi-klinika": {
      summary: "Şöbələr kataloqu, həkimlər və elektron xidmətlərlə xəstəxana saytı.",
      overview:
        "Mərkəzi Klinika Bakıda çoxprofilli xəstəxanadır. Sayt xəstələrə lazımi şöbəni və həkimi tapmağa, xəstəxana və onun filialları ilə tanış olmağa və onlayn xidmətlərdən istifadə etməyə kömək edir.",
      liveFeatures: [
        "Mega-menyuda tibbi şöbələr kataloqu",
        "Həkimlər, filiallar, media və elektron xidmətlər bölmələri",
        "Header-də vurğulanmış təcili yardım xətti",
        AZ_EN_RU,
      ],
    },
    lassa: {
      summary: "Ölçüyə görə təkər axtarışı və məhsul kataloqu olan rəsmi Lassa təkər saytı.",
      overview:
        "Lassa təkərlərinin Azərbaycandakı rəsmi saytı, brendin yerli nümayəndəsi tərəfindən idarə olunur. Ziyarətçilər ölçüyə görə təkər tapa, kateqoriyalara və ən çox satılanlara baxa, qiymət və endirimləri görə, satış nöqtələrini tapa bilirlər.",
      liveFeatures: [
        "En, profil və disk diametrinə görə, mövsüm filtrləri ilə təkər axtarışı",
        "Qiymət, endirim və reytinqli məhsul kartları",
        "Kateqoriyalar, ən çox satılanlar və satış nöqtələri bölmələri",
        AZ_EN_RU,
      ],
    },
    kaan: {
      summary: "Rəsmi çoxbrendli distributorun təkər, disk və akkumulyator onlayn mağazası.",
      overview:
        "Kaan.az bir neçə təkər brendinin rəsmi distributoru olan Kaan International-ın onlayn mağazasıdır. Təkərlər, disklər, akkumulyatorlar və kameralar satılır; ölçüyə və ya avtomobilə görə axtarış və kampaniyalar mövcuddur.",
      liveFeatures: [
        "Ölçü, disk, akkumulyator, kamera və ya avtomobilə görə ətraflı axtarış",
        "Səbət, istək siyahısı və hesab keçidləri",
        "Nəqliyyat növünə görə kateqoriyalar və endirimli məhsullar",
        "Reklam karuseli olan əsas ekran",
      ],
    },
    "eleven-park": {
      summary: "Blok-blok baş plan və mənzil seçimi olan yaşayış kompleksi saytı.",
      overview:
        "Eleven Park hündürmərtəbəli binalardan ibarət yaşayış kompleksidir. Sayt layihəni təqdim edir, nömrələnmiş binalarla baş planı göstərir və alıcıları mənzil seçməyə və ya əlaqə saxlamağa yönləndirir.",
      liveFeatures: [
        "Nömrələnmiş binalarla baş plan illüstrasiyası",
        "Header-də “Mənzil seç” düyməsi",
        AZ_EN_RU,
      ],
    },
    gashalti: {
      summary: "Müalicə proqramları və onlayn rezervasiya ilə Naftalan sağlamlıq oteli.",
      overview:
        "Naftalandakı Gashaltı Health Hotel müalicə proqramları ətrafında qurulmuş sağlamlıq istirahəti təklif edir. Sayt otaqları, Naftalan müalicəsini, tibbi paketləri, SPA və restoranları əhatə edir.",
      liveFeatures: [...HOTEL, "Naftalan müalicəsi və tibbi paketlər bölmələri"],
    },
    galaalti: {
      summary: "Tibbi mərkəzi və müalicəvi su prosedurları olan dağ sağlamlıq kurortu.",
      overview:
        "Galaalti Hotel & SPA Şabranda, Naftsu müalicəvi suyu ilə tanınan dağ kurortudur. Sayt otaqları, görüş və tədbirləri, tibbi mərkəzi, tibbi paketləri və SPA-nı təqdim edir.",
      liveFeatures: [...HOTEL, "Tibbi mərkəz və tibbi paketlər bölmələri"],
      note: "Ekran görüntüsü çəkilən zaman saytın əsas ekranında “müvəqqəti bağlıdır” bildirişi var idi, ona görə önbaxışda otaqlar bölməsi göstərilir.",
    },
    "shamakhi-palace": {
      summary: "Şamaxıda SPA, restoranlar, tədbirlər və əyləncə ilə saray üslublu kurort.",
      overview:
        "Shamakhi Palace Sharadil Şamaxı ətrafında, təbiətin qoynunda yerləşən kurortdur. Sayt otaqları, görüş və tədbirləri, SPA və fitnes mərkəzini, restoranları və əyləncəni təqdim edir; rezervasiya ilk ekrandan mümkündür.",
      liveFeatures: [
        ...HOTEL,
        "Görüş və tədbirlər, SPA və fitnes, restoranlar və əyləncə bölmələri",
      ],
    },
    "ramada-plaza-ganja": {
      summary: "Gəncənin mərkəzində otaqlar, tədbir zalları, restoranlar və SPA ilə otel.",
      overview:
        "Ramada Plaza Gəncə şəhərin mərkəzində yerləşən, Ramada by Wyndham brendinə aid oteldir. Rəsmi sayt otaqları, görüş və tədbir məkanlarını, restoranları və SPA-nı təqdim edir, birbaşa rezervasiyaları artırır.",
      liveFeatures: [...HOTEL, "Görüş və tədbirlər, restoranlar, SPA və fitnes bölmələri"],
    },
    "central-point": {
      summary: "Bakının mərkəzində istirahət və işgüzar səfərlər üçün dördulduzlu otel.",
      overview:
        "The Central Point Bakının mərkəzində dördulduzlu oteldir. Sayt oteli, otaqlarını, restoranlarını və ətrafdakı yerləri təqdim edir; rezervasiya əsas ekrandan edilir.",
      liveFeatures: [...HOTEL, "Restoranlar və “ətrafımızda” bölmələri"],
    },
    "aghdam-city-hotel": {
      summary:
        "Ağdamda SPA və iclas zalları olan, işgüzar və istirahət səfərləri üçün şəhər oteli.",
      overview:
        "Ağdam City Hotel həm işgüzar, həm də istirahət qonaqları üçün Ağdamda müasir oteldir. Sayt otaqları, görüş və tədbirləri, SPA və fitnes mərkəzini təqdim edir; rezervasiya ilk ekrandan mümkündür.",
      liveFeatures: [...HOTEL, "Görüş və tədbirlər, SPA və fitnes bölmələri"],
    },
    "yevlakh-city-hotel": {
      summary: "Yevlaxda müasir otaqlar, restoran, fitnes və iclas məkanı olan şəhər oteli.",
      overview:
        "Yevlax City Hotel Yevlaxda müasir otaqlar, restoran, fitnes imkanları və işgüzar görüşlər üçün məkan təklif edir. Sayt bunların hər birini təqdim edir və rezervasiyaları əsas ekrandan qəbul edir.",
      liveFeatures: [...HOTEL, "Görüş və tədbirlər, restoranlar və fitnes bölmələri"],
    },
    yenee: {
      summary:
        "Sağlamlıq proqramları, müalicələr və tərəfdaş otelləri təqdim edən wellness brendi.",
      overview:
        "YENEE fərdi sağlamlıq proqramları təklif edən wellness brendidir. Sayt brendin fəlsəfəsini, sağlamlıq proqramlarını, müalicələri və tərəfdaş otelləri izah edir, ziyarətçiləri konsultasiyaya və ya istirahətə yazılmağa dəvət edir.",
      liveFeatures: [
        "Həb formalı tipoqrafik vurğularla oynaq, illüstrasiyalı əsas ekran",
        "Fəlsəfə, sağlamlıq proqramları, müalicələr, otellər və bloq bölmələri",
        "Konsultasiya və rezervasiya düymələri",
        AZ_EN_RU,
      ],
    },
    safenet: {
      summary:
        "Təhlükəsizlik və İT sistemləri inteqratoru — video müşahidə, giriş nəzarəti, telefoniya.",
      overview:
        "Safenet təhlükəsizlik, İT və rabitə sistemləri təqdim edir: video müşahidə, giriş nəzarəti, IP telefoniya, İT audit və rentgen yoxlama avadanlığı. Sayt şirkətin xidmətlərini, məhsullarını və tamamlanmış layihələrini təqdim edir.",
      liveFeatures: [
        "Layihə nümunələri karuseli",
        "Xidmətlər və məhsullar mega-menyuları",
        "Layihələr, tərəfdaşlar və bloq bölmələri",
        AZ_EN_RU,
      ],
    },
    "arsenal-fire": {
      summary:
        "Yanğın təhlükəsizliyi sistemləri şirkəti — layihələndirmə, quraşdırma, monitorinq və audit.",
      overview:
        "Arsenal Fire avtomatik yanğınsöndürmə və siqnalizasiyadan tüstüsovurma və yanğın hidrantlarına qədər yanğın təhlükəsizliyi sistemlərini layihələndirir, quraşdırır və monitorinq edir. Sayt xidmət və məhsulları sadalayır, referans layihələri nümayiş etdirir.",
      liveFeatures: [
        "Referans layihələr karuseli",
        "Ətraflı xidmətlər və məhsullar menyuları",
        "Layihələr, tərəfdaşlar və bloq bölmələri",
        AZ_EN_RU,
      ],
    },
    plastcon: {
      summary: "Polimer boru və fitinq istehsalçısı — məhsullar, istehsalat və standartlar.",
      overview:
        "Plastcon Group Polymer polimer borular və fitinqlər istehsal edir. Sayt şirkəti təqdim edir, onun məhsullarını, istehsalatını, tərəfdaşlarını, layihələrini və riayət etdiyi standartları göstərir.",
      liveFeatures: [
        "Məhsul mesajı ilə tam enli, sənaye üslublu əsas ekran",
        "Məhsul kateqoriyaları karuseli",
        "İstehsalat, tərəfdaşlar, layihələr və standartlar bölmələri",
        AZ_EN_RU,
      ],
    },
    "ups-construction": {
      summary: "Sendviç panellər, metal konstruksiyalar və açar təhvil tikinti üzrə şirkət.",
      overview:
        "UPS Construction sendviç panellər, metal konstruksiyalar, konteynerlər və polikarbonat lövhələr tədarük edib quraşdırır, dam, fasad və açar təhvil tikinti işləri görür. Sayt bu çeşidi məhsullar və xidmətlər üzrə qruplaşdırır.",
      liveFeatures: [
        "Məhsullar və xidmətlər mega-menyusu",
        "Layihə fotoşəkilləri və şirkət haqqında təqdimat",
        "Cookie razılıq bannerı və sürətli əlaqə düymələri",
        AZ_EN_RU,
      ],
    },
    granit: {
      summary: "Redaksiya üslublu, daş teksturalı kimliyə malik karxana və partlatma şirkəti.",
      overview:
        "Granit QP karxana və partlatma işləri ilə məşğul olur. Sayt şirkəti və xidmətlərini təqdim etmək üçün iri daş fotoşəkillərindən və serif display şriftdən istifadə edir.",
      liveFeatures: [
        "Display serif tipoqrafiyalı tam ekran əsas bölmə",
        "Fotoşəkillərlə xidmətlər bölməsi",
        AZ_EN_RU,
      ],
    },
    "pasha-property": {
      summary: "Əmlak idarəetmə şirkəti üçün təchizatçı müraciət portalı.",
      overview:
        "PASHA Property Management üçün korporativ portal — təchizatçılar burada addım-addım sorğu vasitəsilə şirkətlə əməkdaşlığa müraciət edir.",
      liveFeatures: ["Addım-addım təchizatçı müraciət forması", AZ_EN],
    },
    quk: {
      summary: "Şöbələr kataloqu, həkimlər və onlayn növbə ilə universitet klinikasının saytı.",
      overview:
        "Universitet təcrübəsini müasir diaqnostika ilə birləşdirən akademik tibb mərkəzi — Qarabağ Universitetinin Klinikasının saytı. Xəstələr tibbi şöbələr və həkimlərlə tanış ola, klinika haqqında öyrənə və onlayn növbə və ya konsultasiyaya yazıla bilirlər.",
      liveFeatures: [
        "Tibbi şöbələr kataloqu — ginekologiya, pediatriya, psixiatriya, radiologiya, laboratoriya və s.",
        "Əsas naviqasiyada həkimlər və klinika bölmələri",
        "Onlayn növbə və zəng düyməsi",
        "Karyera, bloq və foto/video qalereya səhifələri",
        AZ_EN,
      ],
    },
    palid: {
      summary: "Korporativ veb sayt.",
      overview: "One Studio-da hazırladığım korporativ veb sayt.",
      liveFeatures: [],
      unavailableReason:
        "2026-cı ilin oktyabrında ekran görüntüsü çəkməyə çalışarkən canlı sayt SSL xətası (Cloudflare 525) qaytardı, ona görə önbaxış yoxdur.",
    },
  },
};
