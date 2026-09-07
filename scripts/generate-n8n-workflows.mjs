import fs from "node:fs";
import path from "node:path";

const outputDirectory = path.resolve("automation/n8n/workflows");
fs.mkdirSync(outputDirectory, { recursive: true });

const sections = {
  News: "754d8758-df12-47fa-94c0-f3032a082ba6",
  Travel: "d0facefb-1eee-429a-bb85-b85ff9c599c3",
  Entertainment: "5ee72dfd-4ae4-4cc5-98bd-a8ced84ea410",
  Health: "bd3103f0-eda9-46dc-bc05-d32af02a3515",
  Learn: "7af91156-8708-4b85-8f06-34a5ddeaa518",
};

const categories = [
  ["News", "Technology", "b97c9689-9093-40bb-af80-fc0625b939bf", "technology"],
  ["News", "World", "7aaa9917-2239-429c-a6fa-2daf7fe97efa", "world"],
  ["News", "Business", "e4ae5ea7-e21e-4667-acc6-57c2c34fdfc3", "business"],
  ["Travel", "Travel Guides", "f2a0b20a-def5-4bff-9b75-6254718ae2e2", "travel-guides"],
  ["Travel", "Culture", "6ec628d8-2090-4c04-b54d-220626b76022", "culture"],
  ["Travel", "Travel Tips", "3208bc10-3b1f-4e7e-a88c-558ddfeaed68", "travel-tips"],
  ["Entertainment", "Movies", "5c865815-ff1a-48ff-9646-78907857875d", "movies"],
  ["Entertainment", "Series", "2459348b-a796-4e44-ae75-b4ec160b96fa", "series"],
  ["Entertainment", "Music", "dda7fe63-ef9b-4219-857d-d8de91f4959e", "music"],
  ["Health", "Nutrition", "c2b5d5f1-ceda-4823-8ebd-6c4300a9fb03", "nutrition"],
  ["Health", "Fitness", "f75f5a6b-6414-47e4-a23f-1ff15d7ac5f8", "fitness"],
  ["Health", "Wellbeing", "53bf8f12-3bc4-451e-9810-3c2b80a23844", "wellbeing"],
  ["Learn", "SAP", "a6dadbb2-e876-4789-ba76-3c7743f607e0", "sap"],
  ["Learn", "Creative", "10399590-6898-4310-b630-2261caadce0e", "creative"],
  ["Learn", "New Technology", "db4013e5-499a-4df6-a58f-41cb5ad95536", "new-technology"],
].map(([section, category, categoryId, slug], index) => ({ section, category, categoryId, slug, sectionId: sections[section], index }));

const workflowIds = {
  "news-technology": "BY2M7BLQ7HS5pG55",
  "news-world": "JHLGelnb71KNM297",
  "news-business": "fOQceyLRdzckbYOu",
  "travel-travel-guides": "kcPnPvap5TJ4WSj4",
  "travel-culture": "1ekUfgSWYQBIOeAi",
  "travel-travel-tips": "OLn4GbbppNJo5un4",
  "entertainment-movies": "mjOGig08fZdeFAOP",
  "entertainment-series": "RTWOKDWaiMafp7DK",
  "entertainment-music": "xP3glpSatwQsjhLW",
  "health-nutrition": "AnXdbPzUSsVEqj99",
  "health-fitness": "DYhBXdSPWHrZ9qWW",
  "health-wellbeing": "LFG5ByWdMdZaRg0Q",
  "learn-sap": "k1mSUlN4oL16v448",
  "learn-creative": "zb8jvc2fhHtZVoZH",
  "learn-new-technology": "LXaxKAEa9AWbC0LX",
};

const directFeeds = {
  Technology: ["https://feeds.bbci.co.uk/news/technology/rss.xml", "https://techcrunch.com/feed/", "https://feeds.arstechnica.com/arstechnica/index"],
  World: ["https://feeds.bbci.co.uk/news/world/rss.xml", "https://www.theguardian.com/world/rss", "https://www.aljazeera.com/xml/rss/all.xml"],
  Business: ["https://feeds.bbci.co.uk/news/business/rss.xml", "https://www.theguardian.com/business/rss", "https://feeds.npr.org/1006/rss.xml"],
  Movies: ["https://variety.com/v/film/feed/", "https://deadline.com/v/film/feed/"],
  Series: ["https://variety.com/v/tv/feed/", "https://deadline.com/v/tv/feed/"],
  Music: ["https://pitchfork.com/feed/feed-news/rss", "https://www.theguardian.com/music/rss"],
  Nutrition: ["https://www.sciencedaily.com/rss/health_medicine/nutrition.xml"],
  Fitness: ["https://www.sciencedaily.com/rss/health_medicine/fitness.xml"],
  Wellbeing: ["https://www.sciencedaily.com/rss/mind_brain.xml"],
  "New Technology": ["https://techcrunch.com/feed/", "https://feeds.arstechnica.com/arstechnica/technology-lab"],
};

function rssFeeds(category) {
  const query = encodeURIComponent(`${category} latest developments when:3d`);
  return [
    `https://news.google.com/rss/search?q=${query}&hl=en-US&gl=US&ceid=US:en`,
    `https://www.bing.com/news/search?q=${query}&format=rss`,
    ...(directFeeds[category] ?? []),
  ];
}

function modelsFor(category) {
  if (category === "Business") return ["inclusionai/ling-3.0-flash-fin:free", "nvidia/nemotron-3-ultra-550b-a55b:free", "openrouter/free"];
  if (["Nutrition", "Fitness", "Wellbeing"].includes(category)) return ["inclusionai/ling-3.0-flash-sante:free", "nvidia/nemotron-3-ultra-550b-a55b:free", "openrouter/free"];
  return ["inclusionai/ling-3.0-flash-fin:free", "google/gemma-4-31b-it:free", "openrouter/free"];
}

const openRouterHeaders = {
  parameters: [
    { name: "Authorization", value: "=Bearer {{$env.OPENROUTER_API_KEY}}" },
    { name: "HTTP-Referer", value: "={{ $env.EVERYGYAN_SITE_URL || 'https://everygyan.com' }}" },
    { name: "X-Title", value: "EveryGyan n8n Editorial" },
  ],
};

const supabaseHeaders = (prefer) => ({ parameters: [
  { name: "apikey", value: "={{ $env.SUPABASE_SERVICE_ROLE_KEY }}" },
  { name: "Authorization", value: "=Bearer {{$env.SUPABASE_SERVICE_ROLE_KEY}}" },
  ...(prefer ? [{ name: "Prefer", value: prefer }] : []),
] });

function node(name, type, position, parameters = {}, extra = {}) {
  return { parameters, id: crypto.randomUUID(), name, type, typeVersion: extra.typeVersion ?? 1, position, ...extra, typeVersion: extra.typeVersion ?? 1 };
}

function openRouterNode(name, position, bodyExpression) {
  return node(name, "n8n-nodes-base.httpRequest", position, {
    method: "POST",
    url: "https://openrouter.ai/api/v1/chat/completions",
    sendHeaders: true,
    headerParameters: openRouterHeaders,
    sendBody: true,
    specifyBody: "json",
    jsonBody: bodyExpression,
    options: { timeout: 180000 },
  }, { typeVersion: 4.2, retryOnFail: true, maxTries: 3, waitBetweenTries: 12000 });
}

function workflow(config) {
  const day = (config.index % 5) + 1;
  const hour = 5 + Math.floor(config.index / 5) * 5;
  const feeds = rssFeeds(config.category);
  const models = modelsFor(config.category);
  const configCode = `return [{json:${JSON.stringify({ ...config, feeds, models, imageModel: "bytedance-seed/seedream-5-0-lite" })}}];`;
  const nodes = [
    node("Manual Trigger", "n8n-nodes-base.manualTrigger", [-1280, 40]),
    node("Weekly Schedule", "n8n-nodes-base.scheduleTrigger", [-1280, 180], { rule: { interval: [{ field: "cronExpression", expression: `0 0 ${hour} * * ${day}` }] } }, { typeVersion: 1.2 }),
    node("Category Config", "n8n-nodes-base.code", [-1050, 100], { jsCode: configCode }, { typeVersion: 2 }),
    node("Get Admin Profile", "n8n-nodes-base.httpRequest", [-830, 100], {
      url: "={{ $env.SUPABASE_URL + '/rest/v1/profiles?role=eq.admin&select=id&limit=1' }}",
      sendHeaders: true, headerParameters: supabaseHeaders(), options: { response: { response: { responseFormat: "json" } } },
    }, { typeVersion: 4.2 }),
    node("Expand RSS Feeds", "n8n-nodes-base.code", [-610, 100], { jsCode: "const c=$('Category Config').first().json; return c.feeds.map(feedUrl=>({json:{feedUrl}}));" }, { typeVersion: 2 }),
    node("Read RSS Feed", "n8n-nodes-base.rssFeedRead", [-390, 100], { url: "={{ $json.feedUrl }}" }, { typeVersion: 1.2, continueOnFail: true }),
    node("Curate Top 10", "n8n-nodes-base.code", [-160, 100], { jsCode: `const c=$('Category Config').first().json;
const seen=new Set();
const stories=$input.all().map(i=>i.json).filter(s=>s.title&&s.link).filter(s=>{const key=String(s.link).split('?')[0];if(seen.has(key))return false;seen.add(key);return true;}).map(s=>({title:String(s.title).trim(),url:String(s.link),published:s.isoDate||s.pubDate||'',summary:String(s.contentSnippet||s.content||s.description||'').replace(/<[^>]+>/g,' ').replace(/\\s+/g,' ').slice(0,900)})).sort((a,b)=>Date.parse(b.published||0)-Date.parse(a.published||0)).slice(0,10);
if(stories.length<3) throw new Error('Fewer than three usable RSS stories were found; stopping to avoid a weak article.');
return [{json:{...c,stories}}];` }, { typeVersion: 2 }),
    openRouterNode("Analyse Sources", [70, 100], `={{ JSON.stringify({models:$json.models,messages:[{role:'system',content:'You are a rigorous chief news editor. Use only the supplied RSS evidence. Select one timely angle supported by at least three sources. Distinguish facts from analysis and never invent quotations, statistics or events. Return strict JSON with topic, angle, key_facts, source_urls and cautions.'},{role:'user',content:'Section: '+$json.section+'; category: '+$json.category+'; RSS evidence: '+JSON.stringify($json.stories)}],temperature:0.15,max_tokens:1400,reasoning:{effort:'low',exclude:true},response_format:{type:'json_object'} }) }}`),
    node("Parse Analysis", "n8n-nodes-base.code", [300, 100], { jsCode: `const c=$('Curate Top 10').first().json;const raw=String($json.choices?.[0]?.message?.content||'').replace(/^\\s*\\x60{3}(?:json)?/i,'').replace(/\\x60{3}\\s*$/,'').trim();let analysis;try{const start=raw.indexOf('{');const end=raw.lastIndexOf('}');if(start<0||end<=start)throw new Error('No JSON object');analysis=JSON.parse(raw.slice(start,end+1));}catch{analysis={topic:c.stories[0]?.title||c.category+' developments',angle:'What the latest '+c.category+' reports reveal, where the evidence agrees, and what readers should watch next.',key_facts:c.stories.slice(0,8).map(story=>story.title),source_urls:c.stories.map(story=>story.url),cautions:['RSS summaries provide limited context; retain attribution and avoid unsupported claims.']};}return [{json:{...c,analysis}}];` }, { typeVersion: 2 }),
    openRouterNode("Generate 8-Section Outline", [530, 100], `={{ JSON.stringify({models:$json.models,messages:[{role:'system',content:'Act as the chief editor of EveryGyan. Create a detailed eight-section outline for an original evidence-based article. Each section must have a heading, a specific writing_prompt, target_words between 280 and 320, and source URLs it may rely on. Avoid copying source headlines. Return strictly a JSON object with a sections array and no markdown fences.'},{role:'user',content:'Category: '+$json.category+'; editorial analysis: '+JSON.stringify($json.analysis)+'; evidence: '+JSON.stringify($json.stories)}],temperature:0.2,max_tokens:2600,reasoning:{effort:'low',exclude:true},response_format:{type:'json_object'} }) }}`),
    node("Split Outline", "n8n-nodes-base.code", [760, 100], { jsCode: `const c=$('Parse Analysis').first().json;const raw=String($json.choices?.[0]?.message?.content||'').replace(/^\\s*\\x60{3}(?:json)?/i,'').replace(/\\x60{3}\\s*$/,'').trim();let sections;try{const start=raw.indexOf('{');const end=raw.lastIndexOf('}');if(start<0||end<=start)throw new Error('No JSON object');const parsed=JSON.parse(raw.slice(start,end+1));sections=Array.isArray(parsed)?parsed:parsed.sections;}catch{sections=null;}if(!Array.isArray(sections)||sections.length!==8){const headings=['The development at a glance','Background and wider context','The strongest evidence','How the key players are responding','Practical and industry impact','Risks, limits and unanswered questions','What to watch next','Conclusions and reader takeaways'];sections=headings.map((heading,index)=>({heading,writing_prompt:'Write approximately 300 evidence-based words for '+heading+'. Examine '+String(c.analysis?.angle||c.analysis?.topic||c.category)+' using only the supplied RSS stories. Attribute factual claims, distinguish analysis from confirmed facts, and avoid repetition with the other sections.',target_words:300,source_urls:c.stories.slice(index%3,index%3+5).map(story=>story.url)}));}return sections.map((section,index)=>({json:{...c,section,index}}));` }, { typeVersion: 2 }),
    node("Loop Through Sections", "n8n-nodes-base.splitInBatches", [990, 100], { options: { reset: false } }, { typeVersion: 3 }),
    openRouterNode("Write One Section", [1220, 220], `={{ JSON.stringify({models:$json.models,messages:[{role:'system',content:'Act as an expert journalist. Write only this body section in professional Markdown. Aim for 300 words. Use only supplied evidence, attribute factual claims with inline source links, avoid fabricated quotes or numbers, and do not write an article introduction or conclusion.'},{role:'user',content:'Full angle: '+JSON.stringify($json.analysis)+'; section outline: '+JSON.stringify($json.section)+'; RSS evidence: '+JSON.stringify($json.stories)}],temperature:0.3,max_tokens:1200,reasoning:{effort:'low',exclude:true} }) }}`),
    node("Capture Written Section", "n8n-nodes-base.code", [1450, 220], { jsCode: `const source=$('Loop Through Sections').item.json;const text=$json.choices?.[0]?.message?.content;if(!text)throw new Error('Section writer returned no text.');return [{json:{index:source.index,heading:source.section.heading,text:String(text),category:source.category}}];` }, { typeVersion: 2 }),
    node("Aggregate Sections", "n8n-nodes-base.aggregate", [1220, -60], { aggregate: "aggregateAllItemData", destinationFieldName: "sections", options: {} }),
    openRouterNode("Assemble and Polish", [1450, -60], `={{ JSON.stringify({models:['inclusionai/ling-3.0-flash-fin:free','google/gemma-4-31b-it:free','openrouter/free'],messages:[{role:'system',content:'You are the final EveryGyan editor. Smooth transitions and remove only genuine repetition while preserving the substantive reporting, source links and factual caveats from all eight sections. Do not summarize the sections into a short article. Target 2,000 to 2,500 words and never exceed 2,500 words. Return strict JSON: headline (new and not copied), summary (35-55 words), body_markdown with professional ## headings, tags (5-10 strings), seo_title (max 60 characters), meta_description (140-160 characters), image_prompt (editorial 16:9 photo, no text/logos), image_alt. Never add facts absent from the supplied sections.'},{role:'user',content:'Category: '+$('Category Config').first().json.category+'; completed sections: '+JSON.stringify($json.sections)}],temperature:0.2,max_tokens:6500,reasoning:{effort:'low',exclude:true},response_format:{type:'json_object'} }) }}`),
    node("Parse Final Article", "n8n-nodes-base.code", [1680, -60], { jsCode: `const c=$('Category Config').first().json;const context=$('Parse Analysis').first().json;const rows=($('Aggregate Sections').first().json.sections||[]).map(value=>value.json||value).sort((a,b)=>(a.index||0)-(b.index||0));const assembled=rows.map(row=>String(row.text||'').trim()).filter(Boolean).join('\\n\\n');if(!assembled)throw new Error('No completed article sections were available.');const topic=String(context.analysis?.topic||context.analysis?.angle||c.category+' update').trim();const angle=String(context.analysis?.angle||'A detailed review of the latest '+c.category+' developments, their context and practical implications.').trim();const fallback={headline:topic.slice(0,140),summary:angle.slice(0,320),body_markdown:assembled,tags:[c.category,c.section,'Latest updates','EveryGyan'],seo_title:topic.slice(0,60),meta_description:angle.slice(0,160),image_prompt:'Professional editorial documentary photograph representing '+topic+', visually accurate, engaging 16:9 composition, no words, captions, logos or watermarks.',image_alt:topic};const raw=$json.choices?.[0]?.message?.content;let article=fallback;if(raw){try{const parsed=JSON.parse(String(raw).replace(/^\\s*\\x60{3}(?:json)?/i,'').replace(/\\x60{3}\\s*$/,'').trim());article={...fallback,...parsed};}catch{article=fallback;}}if(!article.headline||!article.summary||!article.body_markdown)article=fallback;return [{json:{...context,article}}];` }, { typeVersion: 2 }),
    node("Generate Featured Image", "n8n-nodes-base.httpRequest", [1910, -60], {
      method: "POST", url: "https://openrouter.ai/api/v1/images", sendHeaders: true, headerParameters: openRouterHeaders,
      sendBody: true, specifyBody: "json", jsonBody: "={{ JSON.stringify({model:$json.imageModel,prompt:$json.article.image_prompt,resolution:'2K',aspect_ratio:'16:9',n:1,output_format:'png'}) }}", options: { timeout: 240000 },
    }, { typeVersion: 4.2, retryOnFail: true, maxTries: 3, waitBetweenTries: 15000 }),
    node("Prepare Image Binary", "n8n-nodes-base.code", [2140, -60], { jsCode: `const c=$('Parse Final Article').first().json;const image=$json.data?.[0];if(!image?.b64_json)throw new Error('Image model did not return base64 image data.');const mediaType=image.media_type||'image/png';const extension=mediaType==='image/jpeg'?'jpg':mediaType==='image/webp'?'webp':'png';const fileName=Date.now()+'-'+Math.random().toString(36).slice(2,9)+'.'+extension;const storagePath='automation/'+c.slug+'/'+fileName;return [{json:{...c,storagePath,mediaType},binary:{data:{data:image.b64_json,mimeType:mediaType,fileName}}}];` }, { typeVersion: 2 }),
    node("Upload Image to Supabase", "n8n-nodes-base.httpRequest", [2370, -60], {
      method: "POST", url: "={{ $env.SUPABASE_URL + '/storage/v1/object/article-images/' + $('Prepare Image Binary').first().json.storagePath }}",
      sendHeaders: true, headerParameters: { parameters: [...supabaseHeaders().parameters, { name: "Content-Type", value: "={{ $('Prepare Image Binary').first().json.mediaType }}" }, { name: "x-upsert", value: "false" }] }, sendBody: true, contentType: "binaryData", inputDataFieldName: "data", options: { timeout: 120000 },
    }, { typeVersion: 4.2, retryOnFail: true, maxTries: 3, waitBetweenTries: 5000 }),
    node("Prepare Safe Draft", "n8n-nodes-base.code", [2600, -60], { jsCode: `const c=$('Prepare Image Binary').first().json;const a=c.article;const escape=s=>String(s??'').replace(/[&<>\"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[ch]));const inline=s=>escape(s).replace(/\\*\\*(.+?)\\*\\*/g,'<strong>$1</strong>').replace(/\\[([^\\]]+)\\]\\((https?:\\/\\/[^)]+)\\)/g,'<a href=\"$2\" target=\"_blank\" rel=\"noopener noreferrer\">$1</a>');const html=String(a.body_markdown).split(/\\n{2,}/).map(block=>{const b=block.trim();if(!b)return '';const h=b.match(/^#{1,4}\\s+(.+)/);if(h)return '<h2>'+inline(h[1])+'</h2>';return '<p>'+inline(b).replace(/\\n/g,'<br>')+'</p>';}).join('');const slug=String(a.headline).normalize('NFKD').replace(/[\\u0300-\\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,70)+'-'+Date.now().toString(36);const adminRaw=$('Get Admin Profile').first().json;const admin=Array.isArray(adminRaw)?adminRaw[0]:adminRaw;if(!admin?.id)throw new Error('No Supabase admin profile was found.');const tags=[...new Set((a.tags||[]).map(t=>String(t).trim()).filter(Boolean))].slice(0,10);return [{json:{article:{author_id:admin.id,section_id:c.sectionId,title:a.headline,slug,excerpt:a.summary,content:{type:'html',html,authorName:'Admin',automation:{category:c.category,source_urls:c.analysis?.source_urls||c.stories.map(s=>s.url),generated_at:new Date().toISOString()}},content_html:html,featured_image_url:$env.SUPABASE_URL+'/storage/v1/object/public/article-images/'+c.storagePath,featured_image_alt:a.image_alt||a.headline,status:'draft',is_featured:false,is_breaking:false,allow_comments:true,seo_title:a.seo_title||a.headline,seo_description:a.meta_description||a.summary,published_at:null},categoryId:c.categoryId,tags}}];` }, { typeVersion: 2 }),
    node("Insert Draft Article", "n8n-nodes-base.httpRequest", [3060, -60], { method: "POST", url: "={{ $env.SUPABASE_URL + '/rest/v1/articles?select=id,slug' }}", sendHeaders: true, headerParameters: supabaseHeaders("return=representation"), sendBody: true, specifyBody: "json", jsonBody: "={{ JSON.stringify($json.article) }}", options: {} }, { typeVersion: 4.2 }),
    node("Link Article Category", "n8n-nodes-base.httpRequest", [3290, -60], { method: "POST", url: "={{ $env.SUPABASE_URL + '/rest/v1/article_categories' }}", sendHeaders: true, headerParameters: supabaseHeaders("return=minimal"), sendBody: true, specifyBody: "json", jsonBody: "={{ JSON.stringify({article_id:(Array.isArray($json)?$json[0]:$json).id,category_id:$('Prepare Safe Draft').first().json.categoryId,is_primary:true}) }}", options: {} }, { typeVersion: 4.2 }),
    node("Prepare Tags", "n8n-nodes-base.code", [3520, -60], { jsCode: `const tags=$('Prepare Safe Draft').first().json.tags;return [{json:{tags:tags.map(name=>({name,slug:name.normalize('NFKD').replace(/[\\u0300-\\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,80)})).filter(t=>t.slug)}}];` }, { typeVersion: 2 }),
    node("Upsert Tags", "n8n-nodes-base.httpRequest", [3750, -60], { method: "POST", url: "={{ $env.SUPABASE_URL + '/rest/v1/tags?on_conflict=slug&select=id' }}", sendHeaders: true, headerParameters: supabaseHeaders("resolution=merge-duplicates,return=representation"), sendBody: true, specifyBody: "json", jsonBody: "={{ JSON.stringify($json.tags) }}", options: {} }, { typeVersion: 4.2 }),
    node("Link Article Tags", "n8n-nodes-base.httpRequest", [3980, -60], { method: "POST", url: "={{ $env.SUPABASE_URL + '/rest/v1/article_tags' }}", sendHeaders: true, headerParameters: supabaseHeaders("return=minimal"), sendBody: true, specifyBody: "json", jsonBody: "={{ JSON.stringify((Array.isArray($json)?$json:[$json]).map(tag=>({article_id:(Array.isArray($('Insert Draft Article').first().json)?$('Insert Draft Article').first().json[0]:$('Insert Draft Article').first().json).id,tag_id:tag.id}))) }}", options: {} }, { typeVersion: 4.2 }),
  ];

  const connections = {
    "Manual Trigger": { main: [[{ node: "Category Config", type: "main", index: 0 }]] },
    "Weekly Schedule": { main: [[{ node: "Category Config", type: "main", index: 0 }]] },
    "Category Config": { main: [[{ node: "Get Admin Profile", type: "main", index: 0 }]] },
    "Get Admin Profile": { main: [[{ node: "Expand RSS Feeds", type: "main", index: 0 }]] },
    "Expand RSS Feeds": { main: [[{ node: "Read RSS Feed", type: "main", index: 0 }]] },
    "Read RSS Feed": { main: [[{ node: "Curate Top 10", type: "main", index: 0 }]] },
    "Curate Top 10": { main: [[{ node: "Analyse Sources", type: "main", index: 0 }]] },
    "Analyse Sources": { main: [[{ node: "Parse Analysis", type: "main", index: 0 }]] },
    "Parse Analysis": { main: [[{ node: "Generate 8-Section Outline", type: "main", index: 0 }]] },
    "Generate 8-Section Outline": { main: [[{ node: "Split Outline", type: "main", index: 0 }]] },
    "Split Outline": { main: [[{ node: "Loop Through Sections", type: "main", index: 0 }]] },
    "Loop Through Sections": { main: [[{ node: "Aggregate Sections", type: "main", index: 0 }], [{ node: "Write One Section", type: "main", index: 0 }]] },
    "Write One Section": { main: [[{ node: "Capture Written Section", type: "main", index: 0 }]] },
    "Capture Written Section": { main: [[{ node: "Loop Through Sections", type: "main", index: 0 }]] },
    "Aggregate Sections": { main: [[{ node: "Assemble and Polish", type: "main", index: 0 }]] },
    "Assemble and Polish": { main: [[{ node: "Parse Final Article", type: "main", index: 0 }]] },
    "Parse Final Article": { main: [[{ node: "Generate Featured Image", type: "main", index: 0 }]] },
    "Generate Featured Image": { main: [[{ node: "Prepare Image Binary", type: "main", index: 0 }]] },
    "Prepare Image Binary": { main: [[{ node: "Upload Image to Supabase", type: "main", index: 0 }]] },
    "Upload Image to Supabase": { main: [[{ node: "Prepare Safe Draft", type: "main", index: 0 }]] },
    "Prepare Safe Draft": { main: [[{ node: "Insert Draft Article", type: "main", index: 0 }]] },
    "Insert Draft Article": { main: [[{ node: "Link Article Category", type: "main", index: 0 }]] },
    "Link Article Category": { main: [[{ node: "Prepare Tags", type: "main", index: 0 }]] },
    "Prepare Tags": { main: [[{ node: "Upsert Tags", type: "main", index: 0 }]] },
    "Upsert Tags": { main: [[{ node: "Link Article Tags", type: "main", index: 0 }]] },
  };

  return {
    id: workflowIds[`${config.section.toLowerCase()}-${config.slug}`],
    name: `EveryGyan · ${config.section} · ${config.category} · Draft Generator`,
    nodes, connections, pinData: {}, active: false,
    settings: { executionOrder: "v1", saveManualExecutions: true, saveDataErrorExecution: "all", saveDataSuccessExecution: "all", executionTimeout: 1800 },
    versionId: crypto.randomUUID(), meta: { templateCredsSetupCompleted: false }, tags: [],
  };
}

for (const config of categories) {
  const file = path.join(outputDirectory, `${String(config.index + 1).padStart(2, "0")}-${config.section.toLowerCase()}-${config.slug}.json`);
  fs.writeFileSync(file, `${JSON.stringify(workflow(config), null, 2)}\n`);
}

console.log(`Generated ${categories.length} inactive EveryGyan workflows in ${outputDirectory}`);

