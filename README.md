# quakewang.github.io

This is my blog based on the boilerplate of Hugo. I want to share some notes about study here,and some interesting things about my life.

## Development

Use Hugo Extended to build or preview the site. CI uses version 0.134.1.

```sh
hugo server --disableFastRender
```

Run the regression tests with Hugo Extended, Python 3.11 or newer, and Node.js:

```sh
python3 -m unittest discover -s tests -v
node --test tests/*.test.cjs
```

The tests build into temporary directories and check content preservation, navigation,
theme controls, local assets, deterministic stylesheets, and text contrast in both themes.
