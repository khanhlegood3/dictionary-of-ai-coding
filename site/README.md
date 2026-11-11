# Website

`npm run build` turns the dictionary into a static website in `dist/`.

| Input                    | Used for                                   |
| ------------------------ | ------------------------------------------ |
| `internal/Curriculum.md` | Sections and the order of terms            |
| `dictionary/*.md`        | One page per term, plus the search index   |
| `site/styles.css`        | Styles, copied to `dist/assets/`           |
| `site/app.js`            | Theme toggle and search, copied as written |

There is no database and no server code. Every page is built from the markdown
files, so editing an entry and rebuilding is the whole publishing step.

## Preview locally

```sh
npm run build
python3 -m http.server 3000 --directory dist
```

## Deploy

`vercel.json` tells Vercel to run `npm run build` and serve `dist/`. A project
linked to this repository deploys on every push: the production branch goes to
the production domain, and other branches get preview deployments.
