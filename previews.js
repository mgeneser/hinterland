// Song previews, resolved at build time by tools/fetch-previews.js.
//
// Baked deliberately: the iTunes Search API rate-limits per IP, and at a festival
// every phone shares a carrier NAT. Resolving these live would mean a crowd all
// tripping one rate limit together. The app reads this file and only falls back
// to a live lookup if an entry is missing or its URL stops working.
//
// Regenerate with:  node tools/fetch-previews.js
// Last generated: 2026-07-26

const PREVIEWS = {
  "Porch Light": {
    "track": "Fall Back",
    "url": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/69/8a/14/698a1418-3828-5c9f-155d-c2e4e5ba4a3e/mzaf_8445700327157402822.plus.aac.p.m4a",
    "art": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/ee/1b/6e/ee1b6e15-da34-1d71-f70e-63329af94654/artwork.jpg/400x400bb.jpg"
  },
  "Frost Children": {
    "track": "Falling",
    "url": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/04/7e/64/047e64bc-4d7d-81bb-baa5-195f39592581/mzaf_9651434033810581138.plus.aac.p.m4a",
    "art": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/ef/14/8f/ef148f63-6d89-7703-30a8-239e480e1411/198704498367_Cover.jpg/400x400bb.jpg"
  },
  "Jane Remover": {
    "track": "Misplace",
    "url": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/29/b3/30/29b3305e-dcbf-a2ca-615a-ed17d690a425/mzaf_1782542319901994964.plus.aac.p.m4a",
    "art": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/00/5a/62/005a62da-043d-c814-407a-9a36547137c3/193436274180_01_img001.jpg/400x400bb.jpg"
  },
  "Oklou": {
    "track": "blade bird",
    "url": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/ac/19/3b/ac193b75-a45d-5c41-9748-0b49c3d9025c/mzaf_3945730139800349444.plus.aac.p.m4a",
    "art": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/c0/d9/d5/c0d9d5fb-287c-0c0e-671c-14b66dd6fcff/850064074956.jpg/400x400bb.jpg"
  },
  "AUDREY NUNA": {
    "track": "damn Right",
    "url": "https://video-ssl.itunes.apple.com/itunes-assets/Video114/v4/6d/89/3c/6d893c23-b6bc-4111-b395-a6bd0c8e3fe6/mzvf_6324083708952565416.1920w.h264lc.U.p.m4v",
    "art": "https://is1-ssl.mzstatic.com/image/thumb/Video114/v4/cc/22/06/cc22069c-206b-7741-0579-83bfaadee21a/8864486886930101.jpg/400x400bb.jpg"
  },
  "ASHNIKKO": {
    "track": "Halloweenie IV: Innards",
    "url": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview122/v4/b6/29/ff/b629ff31-ad31-7d07-d910-fe5261953bd7/mzaf_13157518759181216004.plus.aac.p.m4a",
    "art": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/cb/52/ee/cb52ee20-89ad-f401-88c5-d2dd08c3e2dd/190296410437.jpg/400x400bb.jpg"
  },
  "beabadoobee": {
    "track": "Coffee",
    "url": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/8e/96/bb/8e96bb39-9543-97e0-86a3-eda9eddab914/mzaf_14089588875445007256.plus.aac.p.m4a",
    "art": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/9a/9e/05/9a9e0570-bee1-20b5-e512-38b5e1168a76/192641174858_Cover.jpg/400x400bb.jpg"
  },
  "KATSEYE": {
    "track": "Touch",
    "url": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/9f/1d/86/9f1d8632-0842-ba50-107d-1f3bc5b7b362/mzaf_6667750882234216216.plus.aac.p.m4a",
    "art": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/08/fb/6a/08fb6a32-8856-f1f4-148b-8959bff0efb0/24UMGIM67773.rgb.jpg/400x400bb.jpg"
  },
  "Duo Beats": {
    "track": "Clover",
    "url": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/5d/27/9f/5d279f6b-5a17-bbb4-3c2b-95bdc06befa2/mzaf_13020686511683008563.plus.aac.p.m4a",
    "art": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/1e/24/8b/1e248b72-dfc3-c805-c029-2e62a22f55ee/artwork.jpg/400x400bb.jpg"
  },
  "Lipstick Homicide": {
    "track": "What's Expected of You",
    "url": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview122/v4/77/95/10/7795103c-19c5-d737-c7ed-b03897bff220/mzaf_16930040232937340170.plus.aac.p.m4a",
    "art": "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/2a/cc/81/2acc812a-ad27-3d76-2a04-fcb2b5c48c92/198015029229.jpg/400x400bb.jpg"
  },
  "Nourished by Time": {
    "track": "Daddy",
    "url": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/1c/c9/8e/1cc98e70-b68d-7640-5f8f-f395bcbb5710/mzaf_4087019019960950659.plus.aac.p.m4a",
    "art": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/35/80/fe/3580fec2-babb-becd-6556-9eda3fb9b9c9/5057998161133_T.jpg/400x400bb.jpg"
  },
  "Pixel Grip": {
    "track": "Pursuit",
    "url": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview124/v4/be/37/c6/be37c6f2-7a89-05dd-7181-a2c649ae919d/mzaf_3245759568924096983.plus.aac.p.m4a",
    "art": "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/69/89/5d/69895df3-911a-2291-fc2e-a70c93a54ab8/artwork.jpg/400x400bb.jpg"
  },
  "Saint Avangeline": {
    "track": "Lilith",
    "url": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/9b/3e/8f/9b3e8f2d-78cf-b72c-4ae9-20fe1ea478fc/mzaf_18384241037190963987.plus.aac.p.m4a",
    "art": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/d8/43/eb/d843eb9d-b64b-8f67-eec3-a60d32f173c9/345015.jpg/400x400bb.jpg"
  },
  "Wisp": {
    "track": "Your face",
    "url": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/6d/7e/41/6d7e412d-6df1-6260-33f3-ad708ccda9a5/mzaf_13546848649519335183.plus.aac.p.m4a",
    "art": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/71/6b/3e/716b3ead-7b3e-4ed3-de10-9901a8def547/23UM1IM14773.rgb.jpg/400x400bb.jpg"
  },
  "SOFIA ISELLA": {
    "track": "Hot Gum",
    "url": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/e1/a8/7c/e1a87ccb-ae89-a992-fff8-932723fbe560/mzaf_12807474700172019488.plus.aac.p.m4a",
    "art": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/b8/b2/71/b8b27178-48ef-56cd-f252-79b4a3840873/859772744694_cover.jpg/400x400bb.jpg"
  },
  "Paris Paloma": {
    "track": "labour (clean)",
    "url": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/f2/82/87/f28287f9-5a2a-16a3-35f6-e93a7e464deb/mzaf_693213580296322817.plus.aac.p.m4a",
    "art": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/e2/96/0d/e2960db4-a3d2-3935-6f6d-8616e128ffd8/067003515665.png/400x400bb.jpg"
  },
  "Snow Strippers": {
    "track": "Under Your Spell",
    "url": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/6a/ee/34/6aee348f-efdc-0d1f-fe0e-259624df1813/mzaf_4808263238965247528.plus.aac.p.m4a",
    "art": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/52/8d/11/528d1131-16fd-c95d-b283-3e6f3fcfb8a5/4103.jpg/400x400bb.jpg"
  },
  "MUNA": {
    "track": "Silk Chiffon (feat. Phoebe Bridgers)",
    "url": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/de/dc/a2/dedca226-5c2c-7767-6d14-a1fc0b133d65/mzaf_3625606279159258339.plus.aac.p.m4a",
    "art": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/65/5f/7f/655f7f7b-25d8-40de-465c-8c8348919e1d/31341.jpg/400x400bb.jpg"
  },
  "Lorde": {
    "track": "Royals",
    "url": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/4c/50/2e/4c502ee4-d63e-3f7c-11cc-61b2e0c92656/mzaf_4849324024240261165.plus.aac.p.m4a",
    "art": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/b9/e2/d0/b9e2d0af-8ce2-e078-d4e2-eccf24d7e206/12UMGIM55707.rgb.jpg/400x400bb.jpg"
  },
  "Crooked Torus": {
    "track": "Torus Slide",
    "url": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview113/v4/de/11/f0/de11f093-8dd3-c9a6-4a2a-09bf652fc8ad/mzaf_7948868866116330126.plus.aac.p.m4a",
    "art": "https://is1-ssl.mzstatic.com/image/thumb/Music123/v4/93/17/e4/9317e4ec-fa5c-48cf-0795-539bdbc5f146/artwork.jpg/400x400bb.jpg"
  },
  "Sarah Tonin": {
    "track": "red lights // love letters",
    "url": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/29/c2/38/29c2389d-6a53-c824-afd4-9bc7e748a9d3/mzaf_2798602841288678604.plus.aac.p.m4a",
    "art": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/43/96/a9/4396a929-2265-6905-29d6-3c85e31dc650/artwork.jpg/400x400bb.jpg"
  },
  "Leslie & The Ly's": {
    "track": "Gem Sweater",
    "url": "https://audio-ssl.itunes.apple.com/itunes-assets/Music/ed/fc/80/mzm.cacmzlex.aac.p.m4a",
    "art": "https://is1-ssl.mzstatic.com/image/thumb/Music/y2005/m04/d26/h00/s05.wrplailr.tif/400x400bb.jpg"
  },
  "Between Friends": {
    "track": "affection",
    "url": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/bb/e6/30/bbe630c2-05bb-13d7-50a0-9390786b25bc/mzaf_3336418250030672763.plus.aac.p.m4a",
    "art": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/9a/b5/3f/9ab53f1c-02df-d2b8-1771-9502687de583/886446885070_Cover.jpg/400x400bb.jpg"
  },
  "Ninajirachi": {
    "track": "iPod Touch",
    "url": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/2d/cb/5d/2dcb5d7d-9827-87f6-0d10-d7a8594c677f/mzaf_13223693110374767797.plus.aac.p.m4a",
    "art": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/51/41/9c/51419c3f-dce3-5072-eb94-fc453f6fdb87/199350974793.jpg/400x400bb.jpg"
  },
  "Amble": {
    "track": "Mariner Boy",
    "url": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/35/41/43/35414361-0394-cb70-d7cd-143346ecabcc/mzaf_14224161331464147017.plus.aac.p.m4a",
    "art": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/97/23/6e/97236e47-cdef-1b67-3534-b78c23f3f288/054391247513.jpg/400x400bb.jpg"
  },
  "Waylon Wyatt": {
    "track": "Everything Under The Sun",
    "url": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/ab/48/e7/ab48e79b-b4bc-e2e0-b7f0-e4c0b8552851/mzaf_18270547249829523300.plus.aac.p.m4a",
    "art": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/82/62/a1/8262a1af-0269-621b-c4f3-2359ff75e8ad/23UM1IM21926.rgb.jpg/400x400bb.jpg"
  },
  "Julia Wolf": {
    "track": "Falling In Love",
    "url": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/62/64/d5/6264d59c-75db-0659-71f5-07e24ffeb36c/mzaf_11894363083745786015.plus.aac.p.m4a",
    "art": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/a4/9d/15/a49d156b-0a3c-a64e-a9af-812afbcedfaf/193436266864_01_img001.jpg/400x400bb.jpg"
  },
  "CMAT": {
    "track": "Take A Sexy Picture Of Me",
    "url": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/2b/24/91/2b249160-0d82-8308-463b-057a9f657083/mzaf_18069233964684403988.plus.aac.p.m4a",
    "art": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/4e/66/2b/4e662be1-06af-1cae-0078-a271530691d3/199350041914.jpg/400x400bb.jpg"
  },
  "Santigold": {
    "track": "L.E.S. Artistes",
    "url": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/ce/e9/bf/cee9bfb4-a819-337c-8a65-6ae7249af923/mzaf_7696879474044583192.plus.aac.p.m4a",
    "art": "https://is1-ssl.mzstatic.com/image/thumb/Features114/v4/00/89/ab/0089ab23-4061-0b81-eb19-0ae5a01cd5b9/dj.lfccekgv.jpg/400x400bb.jpg"
  },
  "The Format": {
    "track": "The First Single (You Know Me)",
    "url": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/4c/69/71/4c697156-266c-6353-33c2-25375c450c46/mzaf_5878994812360296752.plus.aac.p.m4a",
    "art": "https://is1-ssl.mzstatic.com/image/thumb/Features114/v4/d9/55/2b/d9552b0f-ce75-e99a-b6cc-5fe8c919a8de/dj.gwhecxal.jpg/400x400bb.jpg"
  },
  "Jessie Murph": {
    "track": "Wild Ones",
    "url": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/aa/ab/a4/aaaba466-05b1-e260-775f-8979f4262315/mzaf_2382554717732446700.plus.aac.p.m4a",
    "art": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/8d/62/b0/8d62b0f6-b5d5-1872-f6e7-0a7a587bc8be/196871504331.jpg/400x400bb.jpg"
  },
  "Mumford & Sons": {
    "track": "Little Lion Man (Live from Shepherd's Bush Empire, 2010)",
    "url": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/9a/7c/37/9a7c37b5-b068-fc01-4ac5-14e718263056/mzaf_10821258089677444625.plus.aac.p.m4a",
    "art": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/5d/dd/77/5ddd77b5-0331-5ce2-ac33-901e3aad85bd/0044003151451_Cover.jpg/400x400bb.jpg"
  },
  "Derry & the Dirty Dishes": {
    "track": "Garbage Truck",
    "url": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/e8/46/23/e846234e-614c-e2d3-1c9e-9fca895d9b84/mzaf_9740727075441110846.plus.aac.p.m4a",
    "art": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/5d/58/76/5d58766a-d124-8041-ca1d-9ea63307489d/195269358730_cover.jpg/400x400bb.jpg"
  },
  "Quintron & Miss Pussycat": {
    "track": "Swamp Buggy Badass",
    "url": "https://audio-ssl.itunes.apple.com/itunes-assets/Music/v4/ff/cc/73/ffcc73e1-5a00-943e-00e8-ea4401074601/mzaf_70323225876806145.plus.aac.p.m4a",
    "art": "https://is1-ssl.mzstatic.com/image/thumb/Features/72/a4/d7/dj.tqjumkaj.jpg/400x400bb.jpg"
  },
  "The Brook & The Bluff": {
    "track": "Halfway Up",
    "url": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/54/2d/1b/542d1b87-c004-829c-35c1-9aaf3da5aff5/mzaf_5386206653687086288.plus.aac.p.m4a",
    "art": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/03/10/86/03108666-f737-50e7-af0c-becd4519716b/197189009129.jpg/400x400bb.jpg"
  },
  "Buffalo Traffic Jam": {
    "track": "Forgot Your Roots",
    "url": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/3e/16/b4/3e16b489-30da-a3c2-4fe1-f7b2f108612b/mzaf_7215945192813229367.plus.aac.p.m4a",
    "art": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/d3/d5/cc/d3d5cca8-ca59-9382-c143-919a361a1a6b/199331967660.jpg/400x400bb.jpg"
  },
  "Haute & Freddy": {
    "track": "Scantily Clad",
    "url": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/f8/ad/a6/f8ada642-d5e6-f91d-fe40-39fa48086a63/mzaf_8480955468163376416.plus.aac.p.m4a",
    "art": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/d2/9a/19/d29a19f4-879a-a16b-4a40-ab5702813232/075679611796.jpg/400x400bb.jpg"
  },
  "Samia": {
    "track": "Honey",
    "url": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/b7/ea/c4/b7eac4e3-d13f-5730-d821-a99c0cade885/mzaf_13268652913973554430.plus.aac.p.m4a",
    "art": "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/73/fa/c3/73fac3a7-8dd5-6409-d596-d54db43a3ead/196925725187.jpg/400x400bb.jpg"
  },
  "Audrey Hobert": {
    "track": "Sue me",
    "url": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/c2/df/ee/c2dfee0e-dda0-8d0d-e6be-4378c81e3c23/mzaf_11174541762417764906.plus.aac.p.m4a",
    "art": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/2c/2c/55/2c2c557a-cec2-c3f1-c48c-b9223442f1fd/196873397825.jpg/400x400bb.jpg"
  },
  "Suki Waterhouse": {
    "track": "Good Looking",
    "url": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/33/c7/56/33c7560f-22b1-57b8-fd77-857e56746af6/mzaf_2657754448874097337.plus.aac.p.m4a",
    "art": "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/6d/0a/50/6d0a502a-757e-dc44-3c55-1c1822916fbb/098787153767.png/400x400bb.jpg"
  },
  "Wet Leg": {
    "track": "Chaise Longue",
    "url": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/28/de/9d/28de9d70-b9c9-be23-5529-df4b10c5030f/mzaf_18047850957021090475.plus.aac.p.m4a",
    "art": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/22/c5/a0/22c5a086-f246-98fd-c26e-2db44f39aef2/887829123284.png/400x400bb.jpg"
  },
  "Geese": {
    "track": "Cowboy Nudes",
    "url": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/4f/33/72/4f337268-16d9-3cd0-9ac5-f9848bc16c77/mzaf_15204735224153368366.plus.aac.p.m4a",
    "art": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/d8/9a/c1/d89ac16c-b578-7698-1b7b-f18ff9a5eea9/5400863192808_Cover.jpg/400x400bb.jpg"
  },
  "Young Miko": {
    "track": "Classy 101 (Mixed)",
    "url": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/9c/d2/4d/9cd24d66-c419-ba61-8563-598685e1cec1/mzaf_14881369885675595919.plus.aac.p.m4a",
    "art": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/9b/94/be/9b94be57-39c6-c9e8-f869-603a3e151481/662b3dc6-e1cb-4701-afdc-ab6a538cfa3e.png/400x400bb.jpg"
  },
  "Kali Uchis": {
    "track": "telepatía",
    "url": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/0b/56/cb/0b56cbc2-1ba0-20be-4ac2-c9494122a529/mzaf_8775620475686465204.plus.aac.p.m4a",
    "art": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/c2/21/4a/c2214a0a-1355-770e-eef2-7b872f433e02/20UMGIM71274.rgb.jpg/400x400bb.jpg"
  },
  "Koo Koo": {
    "track": "Pop See Ko",
    "url": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/9d/14/c5/9d14c501-55dc-9f85-a6f1-b230d947db6a/mzaf_5379467967657977617.plus.aac.p.m4a",
    "art": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/cd/fc/0e/cdfc0e4d-8434-97bd-1735-ea6594968ea9/00859717369937_Cover.jpg/400x400bb.jpg"
  },
  "Jeffery Lewis": {
    "track": "I Cry",
    "url": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/ff/cd/c4/ffcdc4e2-af70-2d2a-3c4e-f3fb5390d620/mzaf_11695379922834276759.plus.aac.p.m4a",
    "art": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/c5/9b/74/c59b74bf-a15a-a188-d304-90b3362fdaff/859749243366_cover.jpg/400x400bb.jpg"
  },
  "Die Spitz": {
    "track": "Throw Yourself to the Sword",
    "url": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/c9/5b/0a/c95b0ad4-0fa5-7b2c-c87f-eea1ec9f54e5/mzaf_8569950586865023247.plus.aac.p.m4a",
    "art": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/6e/dc/e4/6edce42a-6eed-4694-2ec0-de9728fea5ae/60505.jpg/400x400bb.jpg"
  },
  "Gouge Away": {
    "track": "Idealized",
    "url": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/71/54/76/71547648-aaf2-9db2-4781-6032cb2c329f/mzaf_11871706524504728010.plus.aac.p.m4a",
    "art": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/ac/c0/d9/acc0d9da-e49d-384a-6595-53a1d460fc5a/791689665702.jpg/400x400bb.jpg"
  }
};
