import hashlib
import os
import re
import subprocess
import tempfile
import tomllib
import unittest
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import parse_qs, urlsplit


ROOT = Path(__file__).resolve().parents[1]
ARTICLE = "tech/paimon/paimon002_ci-hang/index.html"


class Page(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.tags = []
        self.poem = []
        self.code = []
        self.footer_tags = []
        self.footer_text = []
        self.in_footer = False
        self.in_poem = False
        self.paragraph = None
        self.code_block = None
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.tags.append((tag, attrs))
        if tag == "footer":
            self.in_footer = True
        if self.in_footer:
            self.footer_tags.append((tag, attrs))
        if tag == "div" and "poetry" in attrs.get("class", "").split():
            self.in_poem = True
        if tag == "p" and self.in_poem:
            self.paragraph = []
        if tag == "code" and "data-lang" in attrs:
            self.code_block = []

    def handle_data(self, data):
        if self.in_footer:
            self.footer_text.append(data)
        if self.paragraph is not None:
            self.paragraph.append(data)
        if self.code_block is not None:
            self.code_block.append(data)

    def handle_endtag(self, tag):
        if tag == "footer":
            self.in_footer = False
        if tag == "p" and self.paragraph is not None:
            self.poem.append("".join(self.paragraph).strip())
            self.paragraph = None
        if tag == "div":
            self.in_poem = False
        if tag == "code" and self.code_block is not None:
            self.code.append("".join(self.code_block))
            self.code_block = None


def rgb(value):
    value = value.removeprefix("#")
    if len(value) == 3:
        value = "".join(channel * 2 for channel in value)
    return [int(value[index:index + 2], 16) / 255 for index in (0, 2, 4)]


def luminance(value):
    channels = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
                for c in rgb(value)]
    return sum(c * weight for c, weight in zip(channels, (0.2126, 0.7152, 0.0722)))


def contrast(first, second):
    high, low = sorted((luminance(first), luminance(second)), reverse=True)
    return (high + 0.05) / (low + 0.05)


class SiteTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp = tempfile.TemporaryDirectory(prefix="blog-theme-test-")
        cls.addClassCleanup(cls.temp.cleanup)
        cls.sites = []
        for second in (0, 1):
            build = Path(cls.temp.name) / str(second)
            env = dict(os.environ, HUGO_RESOURCEDIR=str(build / "resources"))
            result = subprocess.run(
                ["hugo", "--minify", "--noBuildLock", "--destination", str(build / "site"),
                 "--clock", f"2026-10-18T00:00:0{second}Z"],
                cwd=ROOT, env=env, text=True, capture_output=True,
            )
            if result.returncode:
                raise RuntimeError(result.stdout + result.stderr)
            cls.sites.append(build / "site")

    def page(self, path, site=None):
        return Page(((site or self.sites[0]) / path).read_text())

    def stylesheet(self, site):
        href = next(attrs["href"] for tag, attrs in self.page("index.html", site).tags
                    if tag == "link" and "/css/meme" in attrs.get("href", ""))
        return (site / urlsplit(href).path.lstrip("/")).read_text()

    def test_home_preserves_poem(self):
        config = tomllib.loads((ROOT / "config.toml").read_text())
        self.assertEqual(self.page("index.html").poem, config["params"]["homePoetry"])

    def test_home_footer_preserves_license_and_socials(self):
        page = self.page("index.html")
        social_data = tomllib.loads((ROOT / "data/Socials.toml").read_text())["socials"]
        links = [attrs for tag, attrs in page.footer_tags if tag == "a"]
        self.assertEqual([(link["title"], link["href"]) for link in links if "title" in link],
                         [(social["title"], social["url"]) for social in social_data])
        icons = [attrs for tag, attrs in page.footer_tags
                 if tag == "svg" and "social-icon" in attrs.get("class", "").split()]
        self.assertEqual(len(icons), 4)
        self.assertTrue(any("creativecommons.org/licenses/by-nc-sa/4.0" in link["href"] for link in links))
        self.assertIn("CC BY-NC-SA 4.0", "".join(page.footer_text))

    def test_compact_layout_and_footer_are_scoped_to_poetry_home(self):
        home = self.page("index.html")
        self.assertTrue(any(tag == "body" and attrs.get("class") == "home-poetry"
                            for tag, attrs in home.tags))
        self.assertNotIn("Powered by", "".join(home.footer_text))
        for path in ("tech/index.html", "life/index.html", "about/index.html", ARTICLE):
            with self.subTest(path=path):
                page = self.page(path)
                self.assertFalse(any("home-poetry" in attrs.get("class", "").split()
                                     or "home-footer-meta" in attrs.get("class", "").split()
                                     for _, attrs in page.tags))
                self.assertIn("Powered by", "".join(page.footer_text))

    def test_theme_control_and_assets_on_each_page(self):
        for path in ("index.html", "tech/index.html", "life/index.html", "about/index.html", ARTICLE):
            with self.subTest(path=path):
                page = self.page(path)
                controls = [attrs for tag, attrs in page.tags
                            if tag == "button" and attrs.get("id") == "theme-toggle"]
                self.assertEqual(len(controls), 1)
                self.assertEqual(controls[0]["type"], "button")
                self.assertTrue(controls[0].get("aria-label"))
                trigger = next(attrs for _, attrs in page.tags
                               if "nav-toggle" in attrs.get("class", "").split())
                self.assertEqual(trigger["aria-expanded"], "false")
                self.assertEqual([(tag, attrs.get("class")) for tag, attrs in page.tags
                                  if attrs.get("id") == trigger["aria-controls"]], [("ul", "menu")])
                self.assertTrue(any(urlsplit(attrs.get("src", "")).path == "/js/theme-switcher.js"
                                    for tag, attrs in page.tags if tag == "script"))
                for tag, attrs in page.tags:
                    asset = attrs.get("src") if tag == "script" else None
                    if tag == "link" and attrs.get("rel") == "stylesheet":
                        asset = attrs["href"]
                    if asset and asset.startswith("/") and not asset.startswith("//"):
                        self.assertTrue((self.sites[0] / urlsplit(asset).path.lstrip("/")).is_file(), asset)

    def test_article_marks_its_section_active(self):
        current = [attrs["href"] for tag, attrs in self.page(ARTICLE).tags
                   if tag == "a" and attrs.get("aria-current") == "page"]
        self.assertEqual(current, ["/tech/"])

    def test_share_links_have_a_valid_handle_and_an_existing_fallback_image(self):
        links = [urlsplit(attrs["href"]) for tag, attrs in self.page(ARTICLE).tags
                 if tag == "a" and "href" in attrs]
        twitter = next(link for link in links if link.netloc == "twitter.com" and link.path == "/share")
        handle = tomllib.loads((ROOT / "config.toml").read_text())["params"].get("siteTwitter")
        self.assertEqual(parse_qs(twitter.query).get("via", []), [handle] if handle else [])
        weibo = next(link for link in links if link.netloc == "service.weibo.com")
        image = urlsplit(parse_qs(weibo.query)["pic"][0])
        self.assertTrue((self.sites[0] / image.path.lstrip("/")).is_file())

    def test_custom_asset_versions_match_their_content(self):
        for path in ("index.html", "tech/index.html", "life/index.html", "about/index.html", ARTICLE):
            with self.subTest(path=path):
                assets = [urlsplit(attrs.get("src") or attrs.get("href", ""))
                          for tag, attrs in self.page(path).tags if tag in ("link", "script")]
                for name in ("/css/custom.css", "/js/custom.js", "/js/header-effects.js",
                             "/js/theme-switcher.js"):
                    matches = [asset for asset in assets if asset.path == name]
                    self.assertEqual(len(matches), 1)
                    content = (self.sites[0] / name.lstrip("/")).read_bytes()
                    self.assertEqual(parse_qs(matches[0].query),
                                     {"v": [hashlib.sha256(content).hexdigest()]})

    def test_navigation_renders_decorative_svg_icons(self):
        for path in ("index.html", "tech/index.html", "life/index.html", "about/index.html", ARTICLE):
            with self.subTest(path=path):
                icons = [attrs for tag, attrs in self.page(path).tags
                         if tag == "svg" and "navigation-icon" in attrs.get("class", "").split()]
                self.assertEqual(len(icons), 6)
                for icon in icons:
                    self.assertEqual(icon["viewbox"], "0 0 24 24")
                    self.assertEqual(icon["aria-hidden"], "true")
                    self.assertEqual(icon["focusable"], "false")

    def test_article_progress_controls_and_script_are_present(self):
        for path in (ARTICLE, "life/26_09-oumini/index.html"):
            with self.subTest(path=path):
                page = self.page(path)
                bars = [attrs for _, attrs in page.tags if attrs.get("role") == "progressbar"]
                self.assertEqual(len(bars), 1)
                self.assertEqual(bars[0]["aria-valuemin"], "0")
                self.assertEqual(bars[0]["aria-valuemax"], "100")
                self.assertTrue(bars[0].get("aria-label"))
                self.assertEqual(bars[0]["class"], "reading-progress")
                toc_index = next(index for index, (_, attrs) in enumerate(page.tags)
                                 if attrs.get("class") == "toc-container")
                progress_index = next(index for index, (_, attrs) in enumerate(page.tags)
                                      if attrs.get("role") == "progressbar")
                self.assertGreater(progress_index, toc_index)
                self.assertFalse(any("reading-progress-bar-container" in attrs.get("class", "").split()
                                     for _, attrs in page.tags))
                self.assertFalse(any("sidebar-progress" in attrs.get("class", "").split()
                                     for _, attrs in page.tags))
                scripts = [urlsplit(attrs["src"]) for tag, attrs in page.tags
                           if tag == "script" and "reading-progress.js" in attrs.get("src", "")]
                self.assertEqual(len(scripts), 1)
                content = (self.sites[0] / scripts[0].path.lstrip("/")).read_bytes()
                self.assertEqual(parse_qs(scripts[0].query),
                                 {"v": [hashlib.sha256(content).hexdigest()]})

    def test_article_preserves_code(self):
        for article in (ARTICLE, "tech/doris/doris003_loaddata/index.html",
                        "tech/datastructes/question001/index.html",
                        "tech/doris/doris001_sync-mysql2doris/index.html"):
            with self.subTest(article=article):
                source = next(path for path in (ROOT / "content").rglob("*.md")
                              if str(path.relative_to(ROOT / "content")).lower()
                              == article.replace("/index.html", ".md"))
                fences = re.findall(r"```[^\n]*\n(.*?)\n```", source.read_text(), re.DOTALL)
                self.assertGreater(len(fences), 0)
                self.assertEqual([block.rstrip() for block in self.page(article).code],
                                 [block.rstrip() for block in fences])

    def test_palette_is_stable_between_builds(self):
        self.assertEqual(self.stylesheet(self.sites[0]), self.stylesheet(self.sites[1]))

    def theme_tokens(self):
        themes = {}
        for block in re.findall(r"[^{}]+\{([^{}]*)\}", self.stylesheet(self.sites[0])):
            declarations = dict(tuple(part.strip() for part in item.split(":", 1))
                                for item in block.split(";") if ":" in item)
            name = declarations.get("--theme-name", "").strip('"\'')
            if name in ("light", "dark"):
                themes[name] = declarations
        self.assertEqual(set(themes), {"light", "dark"})
        return themes

    def test_theme_text_contrast(self):
        themes = self.theme_tokens()
        for name, tokens in themes.items():
            def resolve(token):
                value = tokens[token]
                return resolve(value[4:-1]) if value.startswith("var(") else value

            for token in ("--color-contrast-higher", "--color-contrast-high",
                          "--color-contrast-medium", "--color-primary"):
                with self.subTest(theme=name, token=token):
                    self.assertGreaterEqual(contrast(resolve(token), resolve("--color-bg")), 4.5)
            for token in tokens:
                if (token.startswith("--chroma-") and token.endswith("-color")
                        and token not in ("--chroma-background-color", "--chroma-border-color")):
                    with self.subTest(theme=name, token=token):
                        self.assertGreaterEqual(contrast(resolve(token), resolve("--chroma-background-color")), 4.5)

    def test_light_theme_has_distinct_readable_text_levels(self):
        tokens = self.theme_tokens()["light"]
        self.assertLess(luminance(tokens["--color-contrast-higher"]),
                        luminance(tokens["--color-contrast-high"]))
        self.assertLess(luminance(tokens["--color-contrast-high"]),
                        luminance(tokens["--color-contrast-medium"]))
        for background in ("--color-contrast-lower", "--toc-active-background"):
            for foreground in ("--color-contrast-high", "--color-contrast-medium", "--color-primary"):
                with self.subTest(background=background, foreground=foreground):
                    self.assertGreaterEqual(contrast(tokens[foreground], tokens[background]), 4.5)

    def test_dark_theme_has_distinct_readable_text_levels(self):
        tokens = self.theme_tokens()["dark"]
        self.assertGreater(luminance(tokens["--color-contrast-higher"]),
                           luminance(tokens["--color-contrast-high"]))
        self.assertGreater(luminance(tokens["--color-contrast-high"]),
                           luminance(tokens["--color-contrast-medium"]))
        for background in ("--color-contrast-lower", "--toc-active-background"):
            self.assertGreater(luminance(tokens[background]), luminance(tokens["--color-bg"]))
            for foreground in ("--color-contrast-high", "--color-contrast-medium", "--color-primary"):
                with self.subTest(background=background, foreground=foreground):
                    self.assertGreaterEqual(contrast(tokens[foreground], tokens[background]), 4.5)
        self.assertGreater(luminance(tokens["--chroma-background-color"]),
                           luminance(tokens["--color-bg"]))
        config = tomllib.loads((ROOT / "config.toml").read_text())
        self.assertEqual(config["params"]["themeColorDark"], tokens["--color-bg"])

    def test_light_theme_preserves_existing_colors(self):
        tokens = self.theme_tokens()["light"]
        expected = {
            "--color-primary": "#326b62",
            "--color-contrast-lower": "#f4f5f6",
            "--color-contrast-low": "#e4e7eb",
            "--color-contrast-medium": "#626b76",
            "--color-contrast-high": "#3c4148",
            "--color-contrast-higher": "#242a31",
            "--sidebar-label-color": "var(--color-contrast-medium)",
            "--toc-hover-background": "var(--color-contrast-lower)",
            "--toc-active-background": "#edf0f2",
            "--scrollbar-thumb-color": "#cbd1d7",
            "--scrollbar-thumb-hover-color": "#9ca5b0",
        }
        for name, color in expected.items():
            with self.subTest(token=name):
                self.assertEqual(tokens[name], color)

    def test_background_and_header_palette(self):
        themes = self.theme_tokens()
        config = tomllib.loads((ROOT / "config.toml").read_text())["params"]
        expected = {
            "light": ("#f8f9f7", "#fdfefc", "#e0e5e1", "#326b62", "themeColor"),
            "dark": ("#222428", "#26282c", "#353a41", "#91c0b1", "themeColorDark"),
        }
        for theme, (background, header, border, accent, meta) in expected.items():
            tokens = themes[theme]
            with self.subTest(theme=theme):
                self.assertEqual(tokens["--color-bg"], background)
                self.assertEqual(tokens["--header-background"], header)
                self.assertEqual(tokens["--header-border-color"], border)
                self.assertEqual(tokens["--color-primary"], accent)
                self.assertEqual(config[meta], background)
                self.assertGreater(luminance(header), luminance(background))
                for foreground in ("--color-contrast-high", "--color-contrast-medium", "--color-primary"):
                    self.assertGreaterEqual(contrast(tokens[foreground], header), 4.5)

    def test_code_palette_is_independent_of_site_colors(self):
        expected = {
            "light": ("#f6f7f8", "#303640", "#465f91", "#47705c", "#8a6340", "#6b7280"),
            "dark": ("#25282e", "#d8dee7", "#a0b5df", "#a1c5ad", "#cfb28b", "#959eac"),
        }
        roles = ("background", "text", "keyword", "literal", "number", "comment")
        for theme, tokens in self.theme_tokens().items():
            with self.subTest(theme=theme):
                self.assertEqual(tuple(tokens[f"--chroma-{role}-color"] for role in roles),
                                 expected[theme])
                self.assertEqual(tokens["--chroma-declaration-color"], "var(--chroma-keyword-color)")
                for role in ("name", "attribute"):
                    self.assertEqual(tokens[f"--chroma-{role}-color"], "var(--chroma-text-color)")

    def test_code_keywords_share_one_style(self):
        rules = {}
        for selectors, declarations in re.findall(r"([^{}]+)\{([^{}]*)\}", self.stylesheet(self.sites[0])):
            for selector in selectors.split(","):
                rules[selector.strip()] = dict(tuple(part.strip() for part in item.split(":", 1))
                                               for item in declarations.split(";") if ":" in item)
        for token in ("k", "kc", "kd", "kn", "kp", "kr", "kt", "nt"):
            with self.subTest(token=token):
                for theme in self.theme_tokens().values():
                    color = rules[f".chroma .{token}"]["color"]
                    while color.startswith("var("):
                        color = theme[color[4:-1]]
                    self.assertEqual(color, theme["--chroma-keyword-color"])
        for selector, declarations in rules.items():
            if selector.startswith(".chroma ."):
                self.assertNotEqual(declarations.get("font-style"), "italic")


if __name__ == "__main__":
    unittest.main()
