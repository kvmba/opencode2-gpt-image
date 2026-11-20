# opencode2-gpt-image

GPT Image generation and editing for **OpenCode 1.18.29+ and OpenCode 2** via
Sub2API, CLIProxyAPI, or another compatible Images API. Available on
[npm](https://www.npmjs.com/package/opencode2-gpt-image).

| Tool | Use it for |
| --- | --- |
| `gpt_image` | Generate images or edit reference images |
| `gpt_image_task` | Resume an existing Sub2API async image task |

## Install

Add the plugin with its API connection options to `opencode.json`:

**OpenCode 2** (`plugins`):

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugins": [{
    "package": "opencode2-gpt-image",
    "options": {
      "backend": "api",
      "baseURL": "https://your-proxy.example.com/v1",
      "apiKey": "your-key",
      "insecureTLS": false,
      "defaultModel": "gpt-image-2",
      "asyncMode": "sync",
      "taskTimeoutSeconds": 1800
    }
  }]
}
```

**OpenCode 1.18.29+** (`plugin`):

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": [["opencode2-gpt-image", {
    "backend": "api",
    "baseURL": "https://your-proxy.example.com/v1",
    "apiKey": "your-key",
    "insecureTLS": false,
    "defaultModel": "gpt-image-2",
    "asyncMode": "sync",
    "taskTimeoutSeconds": 1800
  }]]
}
```

## Configure

| Plugin option | Default | Description |
| --- | --- | --- |
| `baseURL` | Required | Proxy URL, with or without `/v1` |
| `apiKey` | Required | Proxy API key |
| `insecureTLS` | `false` | Disable certificate verification for this plugin's API requests |
| `backend` | `"api"` | `"api"` for proxies; `"codex"` for experimental subscription use |
| `defaultModel` | `"gpt-image-2"` | Default Images API model ID or proxy alias (`GPT_IMAGE_DEFAULT_MODEL` when unset) |
| `asyncMode` | `"sync"` | Set `"sub2api"` to submit and poll Sub2API tasks; not a tool argument |
| `taskTimeoutSeconds` | `1800` | Async polling timeout (1–1800 seconds) |

Options take precedence over the corresponding `GPT_IMAGE_*` environment
variables; `CPA_BASE_URL` and `CPA_API_KEY` are also supported as fallbacks.
The tool argument `model` overrides `defaultModel`. For `backend: "api"`, the
plugin forwards the selected ID unchanged; set it to a new model or proxy
alias without changing the plugin. Only plugin configuration can select async
mode and its submission timeout. `insecureTLS` works under Node and Bun without
changing TLS settings for other plugins.

## Usage

Ask the agent to generate an image, or edit one using a reference file:

> Generate a blue origami crane with `gpt_image`, save it under `assets/img`.
>
> Use `gpt_image` with `images: ["assets/img/crane.png"]` to change the background.

`gpt_image` requires a `prompt`. Optional arguments:

| Argument | Accepted values |
| --- | --- |
| `model` | An [Images API model ID](https://developers.openai.com/api/reference/resources/images/methods/generate) or a proxy alias; defaults to `defaultModel` |
| `count` | Request 1–4 images in one call; actual count may vary by backend |
| `size` | `auto` or `WIDTHxHEIGHT` |
| `quality` | `auto`, `low`, `medium`, `high`, `xhigh`, `max`; supported values depend on the backend and model |
| `background` | `auto`, `opaque`, `transparent` |
| `output_format` | `png`, `jpeg`, `webp`, `gif` (animated; API backend only) |
| `frame_count` | GIF only: 2–16 frames per animation (OpenAI default: 9) |
| `frame_duration_ms` | GIF only: integer milliseconds per frame, at least 20 (OpenAI default: 200, rounded to 10 ms) |
| `images` | 1–16 reference images: local paths, `file://`, PNG/JPEG/WebP data URLs, or HTTP(S) URLs |
| `mask` | Optional local PNG path, `file://` URI, or PNG data URL; requires `images` |
| `output_dir` | Absolute or session-relative path; default `.gpt-tmp/` (self-gitignored) |

Model availability and supported options depend on the backend. The plugin saves
and attaches images in their actual returned format.

### Animated GIFs

Use `backend: "api"` and a model with native GIF output, such as
`gpt-image-2.6-flare` or `gpt-image-2.6-sunburst`. Set the model in `defaultModel`
or pass it to `gpt_image`:

```json
{
  "model": "gpt-image-2.6-flare",
  "prompt": "A blue origami crane flaps its wings in a seamless loop.",
  "output_format": "gif",
  "frame_count": 9,
  "frame_duration_ms": 200
}
```

The backend must support [GIF output](https://developers.openai.com/api/docs/guides/image-generation#generate-animated-gif-output),
and your account may need preview access.
Omit `size` or use `"auto"` to let it choose a supported frame size. You can
guide the animation with still `images`, but GIF output cannot use `mask` or
`background: "transparent"`. The plugin saves the returned animation as a `.gif`
without converting or stitching images locally.

### Sub2API async tasks

Set `asyncMode: "sub2api"` in plugin options; the agent cannot change it per
request. Sub2API must have async image tasks enabled; otherwise it returns
404. This mode is not for CLIProxyAPI or direct Codex. OpenCode's tool
description and progress identify the configured mode. After acceptance, the
task ID appears in progress and in the completed result. If polling stops,
**do not submit the image again**: call `gpt_image_task` with the returned
`task_id` to resume. That tool also accepts `output_dir` and `timeout_seconds`.

### Experimental Codex backend

Set `backend: "codex"` to use your OpenCode ChatGPT OAuth connection instead of
the proxy. Best effort: currently only `gpt-image-2`, PNG output, and a plugin
limit of five reference images; no masks or async tasks. The plugin sends `count` (1–4),
`size`, `quality` (`auto`, `low`, `medium`, `high`), and background (including
`transparent`) to Codex. The backend may return a different count, size or
quality; the tool reports mismatches when detectable. Proxy requests never
fall back to Codex.

## Development

This project uses pnpm. Run `pnpm install`, `pnpm typecheck`, `pnpm test`, and
`pnpm build` to validate a local checkout.

## License

MIT licensed. See [LICENSE](LICENSE).
