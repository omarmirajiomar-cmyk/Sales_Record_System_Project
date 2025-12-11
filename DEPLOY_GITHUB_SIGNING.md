Hati: Jinsi ya kuandaa GitHub Releases na Code Signing kwa auto-update (Swahili)

Muhimu: Hatua hizi zinahitaji ruhusa zako za GitHub (repo) na cheti cha kusaini (code signing) kwa Windows kwa kutengeneza builds ambazo zinaweza ku-update moja kwa moja.

1) Unda GitHub repository
- Tuma (push) project huu kwenye GitHub katika repo mpya au iliyopo.

2) Wewe au timu yake: unda Personal Access Token (PAT)
- Nenda GitHub > Settings > Developer settings > Personal access tokens > Tokens (classic) au fine-grained
- Upe token hii haki ya `repo` (read & write) kwa kuchapisha releases.
- Kwenye repo yako, nenda Settings > Secrets and variables > Actions > New repository secret
  - Jina: `GH_TOKEN`
  - Thamani: (weke PAT yako hapa)

3) Sakinisha `package.json` publish config
- Nimeshaweka `build.publish` katika `package.json` na placeholders:
  {
    "provider": "github",
    "owner": "<GITHUB_OWNER>",
    "repo": "<GITHUB_REPO>"
  }
- Badilisha `<GITHUB_OWNER>` na `<GITHUB_REPO>` kwa miliki halisi.

4) Configure code signing (Windows)
- Unahitaji cheti cha kusaini (EV Code Signing) kutoka kwa Certificate Authority (DigiCert, Sectigo, wtv).
- Chombo `electron-builder` kinahitaji vigezo vifuatavyo kusaini exe/msi:
  - `CSC_LINK` = URL (https) ya keystore (.p12) au GitHub secret na `CSC_KEY_PASSWORD`
- Kwa usalama, upakie `.p12` kwenye private storage (e.g., GitHub Secrets) kama `CSC_LINK` (itafadhiliwa kama URL ya faili iliyoshirikiwa) au tumia base64 string.
- Kwenye repo settings > Secrets > New repository secret:
  - `CSC_LINK` = wa upload au link ya keystore
  - `CSC_KEY_PASSWORD` = password ya keystore

5) Kuunda release na kuchapisha (workflow)
- Mening: nimeongeza GitHub Actions workflow `.github/workflows/release.yml` ambayo inachukua tag `v*` (mfano `v1.0.0`) kama trigger.
- Utaratibu: create annotated tag locally na push: e.g.
  ```bash
  git tag -a v1.0.0 -m "release v1.0.0"
  git push origin v1.0.0
  ```
- Workflow itaanza, ku-build na ku-publish assets (exe, blockmap) kama GitHub Release.

6) After publish: auto-update
- `electron-updater` inatumia metadata ya release (GitHub) kupakua update.
- Hakikisha `autoUpdater` imewekwa kwenye `main.js` (nimeweka skeleton ya optional) na `preload` expose handlers.

7) Testing locally
- Bila code signing: GitHub Releases inaweza kuchapisha assets lakini Windows Defender inatoa warnings bila signature.
- Kwa testing ya auto-update, unaweza kutumia `--publish always` ndani GitHub Action/locally na set `GH_TOKEN`.

8) Recovery flow
- Nimeongeza Diagnostics page (Support) ndani app kwa Reset Data na Export DB.
- Ikiwa update ikisababisha tatizo, unaweza:
  - Ku-instruct user ku-run `Reset Local Data` kwenye Support tab
  - Au ku-uninstall app na kuweka tena .exe (fresh install)

Ikiwa unataka, nitasaidia kubadilisha package.json `build.publish.owner/repo` na kuandika hatua za exact commands (na kuunda GitHub repo / secret). Pia ninaweza kuunda sample `release` tag na kufanya run ya test (hata bila signing) kama utatoa GH_TOKEN kama secret kwenye repository yako.
