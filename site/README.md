# Website

`npm run build` turns the dictionary into a static website in `dist/`.

| Input                    | Used for                                          |
| ------------------------ | ------------------------------------------------- |
| `internal/Curriculum.md` | Sections and the order of terms                   |
| `dictionary/*.md`        | One page per term, the search index, the term map |
| `site/styles.css`        | Styles, copied to `dist/assets/`                  |
| `site/app.js`            | Theme toggle and search, copied as written        |
| `site/layout.ts`         | Places each term in 3D for the map, at build time |
| `site/graph.js`          | Draws the map in the browser, copied as written   |

There is no database and no server code. Every page is built from the markdown
files, so editing an entry and rebuilding is the whole publishing step.

## Pages

| Path          | Content                                             |
| ------------- | --------------------------------------------------- |
| `/`           | The 3D term map                                     |
| `/curriculum` | Every term in teaching order, grouped by section    |
| `/a-z`        | Every term in alphabetical order                    |
| `/<slug>`     | One term, as a plain page that works without script |

## The term map

The home page shows every term as a point in 3D. Two terms are linked when one
entry links to the other. Linked terms sit close together, and each curriculum
section forms a loose region.

- Drag to rotate, scroll or pinch to zoom. Arrow keys, `+`, `-` and `0` do the
  same from the keyboard.
- Selecting a term opens it in a side panel and draws its links.
- The address holds the state, so any view can be shared:
  `/?term=harness` selects a term, `/?q=harnes` highlights search matches, and
  the two combine as `/?q=harnes&term=harness`.

`site/build.ts` writes `dist/graph.json` with each term's position, links and
rendered text. Positions come from a seeded layout, so the same entries always
give the same map. The map has no runtime dependencies: `site/graph.js` draws
on a 2D canvas with its own perspective projection.

## Preview locally

```sh
npm run build
python3 -m http.server 3000 --directory dist
```

## Deploy

`vercel.json` tells Vercel to run `npm run build` and serve `dist/`. A project
linked to this repository deploys on every push: the production branch goes to
the production domain, and other branches get preview deployments.
