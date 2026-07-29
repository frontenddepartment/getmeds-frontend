// Centralized navbar category/condition data for the "Product Range" mega-menu and mobile
// accordion in navbar.html. navbar.html is fetched and injected identically by every page
// (see injectHTML() call sites in src/pages/*.tsx), so this file is the single place to edit
// when the menu's category grouping or link-building logic needs to change — navbar.html
// itself just calls fetchAndPopulateDropdown() after injection.
//
// Every item shown (categories, subcategories, and their links) is derived live from the
// product catalog on each page load — nothing here is a fixed/hardcoded list. When the admin
// updates the Excel sheet (new category, new subcategory, new condition), it appears in the
// navbar automatically without any code change.

// Strips a bare domain-prefixed URL from the sheet (e.g. "getmeds.ph/conditions/x", with
// or without a protocol) down to just its path, e.g. "/conditions/x".
function toPath(url) {
    return '/' + String(url).replace(/^https?:\/\//, '').replace(/^[^/]+\/?/, '');
}

// Mirrors folderDisplayName() in src/lib/queries.ts.
function folderDisplayName(folder) {
    return String(folder || '')
        .split('-')
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function splitConditionList(value) {
    if (!value) return [];
    return String(value).split(',').map((s) => s.trim()).filter(Boolean);
}

// Derives the same category/subcategory NAMES the product listing page's sidebar uses —
// see getCategories() in src/lib/queries.ts. Building it from the exact same catalog rows
// (rather than the separate, unmanaged `category` Sanity documents this menu used to read)
// guarantees the menu's category names/subcategory labels are byte-identical to what the
// listing page expects, so every link's condition actually resolves on click, the same way
// clicking a sidebar button does.
//
// `slug` here is a plain slugified category NAME (not the routing `categoryFolder`) — it's
// only used below to match this file's own `categoryConfig` (which column/title to render
// a category under), a navbar-only display concern unrelated to the sidebar's routing slug.
function deriveCategories(rows) {
    const catMap = new Map();
    rows.forEach((row) => {
        const rawCategory = row.category || (row.categoryFolder ? folderDisplayName(row.categoryFolder) : '');
        const catName = String(rawCategory || '').trim();
        if (!catName) return;

        const key = catName.toLowerCase();
        const slug = key.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

        if (!catMap.has(key)) {
            catMap.set(key, { category: catName, slug, subcategory: [] });
        }

        const catObj = catMap.get(key);
        const conditions = row.subCategory
            ? [row.subCategory, ...splitConditionList(row.alsoLinkedFrom)]
            : [];
        conditions.forEach((sub) => {
            if (sub && !catObj.subcategory.includes(sub)) catObj.subcategory.push(sub);
        });
    });
    return Array.from(catMap.values()).sort((a, b) => a.category.localeCompare(b.category));
}

// Dynamically populate Cancer Medicines dropdown and mobile accordion from the live product
// catalog — the same "bulk catalog" doc the frontend reads (see fetchProductsFromExcel() in
// src/lib/queries.ts).
function fetchAndPopulateDropdown() {
    const catalogQuery = '*[_type == "product" && (remarks == "present" || remarks == "active") && defined(title)] | order(_updatedAt desc)[0]{ json_data }';
    const projectId = document.querySelector('meta[name="getmeds-sanity-project-id"]')?.content || 's7ocz8zp';
    const dataset = document.querySelector('meta[name="getmeds-sanity-dataset"]')?.content || 'production';
    const apiVersion = document.querySelector('meta[name="getmeds-sanity-api-version"]')?.content || '2021-10-21';
    const baseUrl = `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}?query=`;

    fetch(baseUrl + encodeURIComponent(catalogQuery)).then(res => res.json())
        .then((catalogData) => {
            let rows = [];
            try {
                const jsonData = catalogData?.result?.json_data;
                if (jsonData) {
                    const parsed = JSON.parse(jsonData);
                    const firstSheet = Object.keys(parsed)[0];
                    rows = firstSheet ? (parsed[firstSheet] || []) : [];
                }
            } catch (err) {
                console.warn('[Getmeds] Failed to parse product catalog:', err);
            }
            if (rows.length === 0) return;

            const subcategorySpecials = {
                'non-small-cell-lung-cancer': 'lung-cancer',
                'acute-myeloid-leukemia': 'aml',
                'chronic-myeloid-leukemia': 'cml',
                'hodgkin-non-hodgkins-lymphoma': 'lymphoma',
                'hodgkin-non-hodgkin-s-lymphoma': 'lymphoma',
                'sickle-cell-anemia': 'sickle-cell',
                'respiratory-infections': 'respiratory',
                'urinary-tract-infections': 'uti',
                'skin-and-soft-tissue-infections': 'skin-infections',
                'bone-and-joint-infections': 'bone-infections',
                'fibrocystic-breast-disease': 'fibrocystic',
                'arrhythmia-management': 'arrhythmia',
                'hypertension-angina': 'hypertension',
                'hypertension-and-angina': 'hypertension',
                'seasonal-allergic-rhinitis': 'allergic-rhinitis',
                'chronic-kidney-disease': 'kidney-disease',
                'chronic-pain': 'pain',
                'inflammatory-disorders': 'rheumatology',
                'inflammatory-and-rheumatic-disorders': 'rheumatology'
            };

            const getSubcategorySlug = (name) => {
                const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                return subcategorySpecials[slug] || slug;
            };

            // Name-based conditionHubUrl lookup, keyed by exact (lowercased) subCategory text.
            const conditionHubPaths = new Map();
            rows.forEach(row => {
                if (row.subCategory && row.conditionHubUrl) {
                    const key = String(row.subCategory).trim().toLowerCase();
                    if (!conditionHubPaths.has(key)) conditionHubPaths.set(key, toPath(row.conditionHubUrl));
                }
            });

            // Secondary conditionHubUrl lookup, keyed by slug instead of exact name text —
            // slugs are far more stable than free text (case/whitespace/punctuation-insensitive
            // via the same getSubcategorySlug used for the fallback itself), so this is tried
            // first everywhere a condition link is built.
            const conditionHubPathsBySlug = new Map();
            rows.forEach(row => {
                if (row.subCategory && row.conditionHubUrl) {
                    const slug = getSubcategorySlug(String(row.subCategory).trim());
                    if (!conditionHubPathsBySlug.has(slug)) conditionHubPathsBySlug.set(slug, toPath(row.conditionHubUrl));
                }
            });

            const resolveHubPath = (name, slug) => {
                const hit = conditionHubPathsBySlug.get(slug) ?? conditionHubPaths.get(name.toLowerCase());
                if (!hit) {
                    // Surfaces exactly which menu items don't have a real conditionHubUrl in
                    // Sanity yet, instead of silently guessing a URL — check the Sanity Studio
                    // "Condition Hub URL (Auto)" column for a row matching this subCategory name.
                    console.warn(`[Getmeds] No conditionHubUrl found in Sanity for "${name}" (slug: ${slug}) — falling back to a guessed URL.`);
                }
                return hit;
            };

            // Exposed globally so the click interceptor in navbar.html's second <script> block
            // (a separate scope) can look up the REAL database link at click time — by name,
            // regardless of what a link's static `href` attribute happens to contain. This is
            // what makes the DB the actual source of truth for navigation instead of whatever
            // markup (hardcoded or stale) is currently sitting in the DOM. Defined here,
            // unconditionally once we have rows, rather than after the menu-rendering bail-out
            // below — the DB lookup must keep working for click handling even if there's no
            // live category data to build a menu display from.
            window.getmedsResolveConditionHubPath = (name) => resolveHubPath(name, getSubcategorySlug(name));

            const categories = deriveCategories(rows);
            if (categories.length === 0) return;

            // Grouping config to keep the static layout and style
            const categoryConfig = {
                'oncology': { col: 0, title: 'Oncology' },
                'hematology': { col: 1, title: 'Hematology' },
                'anti-infectives': { col: 1, title: 'Anti-Infectives' },
                'endocrinology': { col: 2, title: 'Endocrinology' },
                'orthopedic': { col: 2, title: 'Orthopedic' },
                'cardiology': { col: 2, title: 'Cardiology' },
                'neuro-oncology': { col: 3, title: 'Neuro-Oncology' },
                'respiratory': { col: 3, title: 'Respiratory / Allergy', mergeWith: 'allergy' },
                'allergy': { col: 3, title: 'Respiratory / Allergy', mergeWith: 'respiratory' },
                'renal': { col: 3, title: 'Nephrology / Renal', mergeWith: 'nephrology' },
                'nephrology': { col: 3, title: 'Nephrology / Renal', mergeWith: 'renal' },
                'pain-management': { col: 3, title: 'Pain Mgt.' },
                'rheumatology': { col: 3, title: 'Rheumatology' },
                'gynecology': { col: 2, title: 'Gynecology' },
                'obstetrician': { col: 2, title: 'Obstetrician' },
                'radiology': { col: 1, title: 'Radiology' }
            };

            // Group categories that have overlapping subcategories using Jaccard Similarity Graph Grouping (sim >= 0.5)
            const validCats = categories.filter(cat => cat.subcategory && Array.isArray(cat.subcategory) && cat.subcategory.length > 0);

            const jaccardSimilarity = (arr1, arr2) => {
                const setA = new Set(arr1.map(x => x.trim().toLowerCase()));
                const setB = new Set(arr2.map(x => x.trim().toLowerCase()));
                const intersection = new Set([...setA].filter(x => setB.has(x)));
                const union = new Set([...setA, ...setB]);
                return union.size === 0 ? 0 : (intersection.size / union.size);
            };

            const visited = new Set();
            const groups = [];

            for (let i = 0; i < validCats.length; i++) {
                if (visited.has(i)) continue;

                const component = [];
                const queue = [i];
                visited.add(i);

                while (queue.length > 0) {
                    const currIdx = queue.shift();
                    const currCat = validCats[currIdx];
                    component.push(currCat);

                    for (let j = 0; j < validCats.length; j++) {
                        if (visited.has(j)) continue;

                        const sim = jaccardSimilarity(currCat.subcategory, validCats[j].subcategory);
                        if (sim >= 0.5) {
                            visited.add(j);
                            queue.push(j);
                        }
                    }
                }
                groups.push(component);
            }

            const processedCategories = [];
            groups.forEach(groupCats => {
                if (groupCats.length === 1) {
                    processedCategories.push({
                        category: groupCats[0].category,
                        slugs: [groupCats[0].slug],
                        slug: groupCats[0].slug,
                        subcategory: groupCats[0].subcategory
                    });
                } else {
                    const sortedCats = [...groupCats].sort((a, b) => a.category.localeCompare(b.category));
                    const combinedName = sortedCats.map(c => c.category).join(' / ');

                    // Find shared subcategories
                    const subMaps = sortedCats.map(cat => {
                        const map = new Map();
                        cat.subcategory.forEach(sub => {
                            map.set(sub.trim().toLowerCase(), sub);
                        });
                        return map;
                    });

                    const firstMap = subMaps[0];
                    const sharedKeys = [];
                    for (const key of firstMap.keys()) {
                        let inAll = true;
                        for (let k = 1; k < subMaps.length; k++) {
                            if (!subMaps[k].has(key)) {
                                inAll = false;
                                break;
                            }
                        }
                        if (inAll) {
                            sharedKeys.push(key);
                        }
                    }

                    const sharedSubcategories = sharedKeys.map(key => firstMap.get(key));

                    if (sharedSubcategories.length > 0) {
                        processedCategories.push({
                            category: combinedName,
                            slugs: sortedCats.map(c => c.slug),
                            slug: sortedCats[0].slug,
                            subcategory: sharedSubcategories
                        });
                    }

                    // Add unique subcategories for each category in the group
                    sortedCats.forEach(cat => {
                        const uniqueSubs = cat.subcategory.filter(sub => {
                            const norm = sub.trim().toLowerCase();
                            return !sharedKeys.includes(norm);
                        });

                        if (uniqueSubs.length > 0) {
                            processedCategories.push({
                                category: cat.category,
                                slugs: [cat.slug],
                                slug: cat.slug,
                                subcategory: uniqueSubs
                            });
                        }
                    });
                }
            });

            const sections = {};
            processedCategories.forEach(cat => {
                const slugsToCheck = cat.slugs;
                let minCol = 3;
                let confTitle = null;

                for (const s of slugsToCheck) {
                    if (categoryConfig[s]) {
                        if (categoryConfig[s].col < minCol) {
                            minCol = categoryConfig[s].col;
                        }
                        if (!confTitle) {
                            confTitle = categoryConfig[s].title;
                        }
                    }
                }

                const title = (slugsToCheck.length > 1) ? cat.category : (confTitle || cat.category);
                const col = minCol;

                if (!sections[title]) {
                    sections[title] = {
                        title: title,
                        col: col,
                        subcategories: []
                    };
                }

                cat.subcategory.forEach(sub => {
                    if (sub && !sections[title].subcategories.includes(sub)) {
                        sections[title].subcategories.push(sub);
                    }
                });
            });

            const desktopColumns = [[], [], [], []];
            Object.values(sections).forEach(sec => {
                if (sec.subcategories.length > 0) {
                    desktopColumns[sec.col].push(sec);
                }
            });

            const linkCls = "relative inline-block text-gray-500 hover:text-primary transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:w-full after:h-[1px] after:bg-primary after:scale-x-0 after:origin-left hover:after:scale-x-100 after:transition-transform after:duration-300";

            // Subcategory slugs whose topic is cancer/oncology — these route through /cancer-medicines,
            // everything else keeps the /product-range prefix. Only used for the last-resort
            // self-slugified guess below; whenever a real conditionHubUrl exists (the normal
            // case), resolveHubPath() already returns the DB's own path and this is never consulted.
            const cancerSlugs = new Set([
                'oncology', 'breast-cancer', 'ovarian-cancer', 'non-small-cell-lung-cancer', 'lung-cancer',
                'prostate-cancer', 'gastric-cancer-gastric-adenocarcinoma', 'gastric-cancer', 'pancreatic-cancer', 'colorectal-cancer',
                'hodgkin-non-hodgkins-lymphoma', 'hodgkin-non-hodgkin-s-lymphoma', 'lymphoma',
                'acute-lymphoblastic-leukemia', 'malignant-pleural-mesothelioma', 'head-and-neck-cancer',
                'chronic-myeloid-leukemia', 'cml', 'sickle-cell-anemia', 'sickle-cell',
                'malignant-pleural-effusion', 'gastrointestinal-stromal-tumors',
                'acute-myeloid-leukemia', 'aml', 'acute-lymphocytic-leukemia', 'chronic-myelocytic-leukemia',
                'meningeal-leukemia', 'acute-promyelocytic-leukemia', 'chronic-lymphocytic-leukemia',
                'mantle-cell-lymphoma', 'multiple-myeloma', 'neuro-oncology', 'glioblastoma-multiforme', 'glioblastoma'
            ]);
            const categoryPrefix = (slug) => cancerSlugs.has(slug) ? '/cancer-medicines/' : '/product-range/';

            const buildSubLi = (sub) => {
                const subSlug = getSubcategorySlug(sub);
                const href = resolveHubPath(sub, subSlug) || `${categoryPrefix(subSlug)}${subSlug}`;
                return `<li><a href="${href}" class="${linkCls}">${sub}</a></li>`;
            };

            // Every column (0-3) is rendered purely from `desktopColumns`/`sections`, which are
            // themselves built entirely from the live product catalog above — no fixed item
            // lists. When the admin adds a new category or subcategory to the Excel sheet, it
            // appears here automatically on the next page load; nothing in this file needs to
            // be edited. `categoryConfig` only nudges an EXISTING category's column/title for
            // layout purposes — it never determines which subcategories show up.
            const desktopGrid = document.getElementById('desktop-dropdown-grid');
            if (desktopGrid) {
                let gridHtml = '';
                [0, 1, 2, 3].forEach((colIdx) => {
                    const colSections = desktopColumns[colIdx] || [];
                    gridHtml += '<div>';
                    colSections.forEach((sec, secIdx) => {
                        const h4Class = secIdx > 0 ? 'font-semibold text-gray-900 mb-4 border-b pb-2 text-sm mt-6' : 'font-semibold text-gray-900 mb-4 border-b pb-2 text-sm';
                        const ulClass = secIdx < colSections.length - 1 ? 'space-y-2 text-[13px] mb-6' : 'space-y-2 text-[13px]';
                        gridHtml += `<h4 class="${h4Class}">${sec.title}</h4><ul class="${ulClass}">`;
                        gridHtml += sec.subcategories.map(buildSubLi).join('');
                        gridHtml += '</ul>';
                    });
                    gridHtml += '</div>';
                });
                desktopGrid.innerHTML = gridHtml;
            }

            const mobileAccordion = document.getElementById('mobile-products');
            if (mobileAccordion) {
                let mobileHtml = '';
                Object.values(sections).forEach(sec => {
                    if (sec.subcategories.length > 0) {
                        mobileHtml += `<p class="px-3 pt-3 pb-1 text-[12px] font-semibold uppercase text-black tracking-wider">${sec.title}</p>`;
                        sec.subcategories.forEach(sub => {
                            const subSlug = getSubcategorySlug(sub);
                            const href = resolveHubPath(sub, subSlug) || `${categoryPrefix(subSlug)}${subSlug}`;
                            mobileHtml += `<a href="${href}" class="block pl-5 py-2 text-[13px] text-gray-600 hover:text-primary transition">${sub}</a>`;
                        });
                    }
                });
                mobileAccordion.innerHTML = mobileHtml;

                // Re-check which of these freshly-built links matches the current page, now
                // that the real hrefs exist — see navbar.html's getmedsHighlightActiveProductLink
                // for why its earlier pass (against the placeholder markup this just replaced)
                // can't have found anything.
                if (typeof window.getmedsHighlightActiveProductLink === 'function') {
                    window.getmedsHighlightActiveProductLink();
                }
            }
        })
        .catch(err => console.warn('[Getmeds] Failed to populate dropdown with dynamic categories:', err));
}
