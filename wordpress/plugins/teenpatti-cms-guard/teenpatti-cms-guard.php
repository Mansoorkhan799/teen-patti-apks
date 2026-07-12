<?php
/**
 * Plugin Name: Teen Patti CMS Guard
 * Plugin URI:  https://teenpattiapks.com.pk
 * Description: Keeps cms.teenpattiapks.com.pk write-only: 301 redirects public pages to the main Next.js site, blocks crawlers via robots.txt, forces noindex, and overrides Rank Math. Also handles headless REST fields, CORS, and Next.js revalidation.
 * Version:     1.0.0
 * Author:      Teen Patti APKs
 * Author URI:  https://teenpattiapks.com.pk
 * License:     GPL-2.0-or-later
 * Text Domain: teenpatti-cms-guard
 */

if (!defined('ABSPATH')) {
    exit;
}

define('TEENPATTI_CMS_GUARD_VERSION', '1.0.0');
define('TEENPATTI_CMS_GUARD_FILE', __FILE__);

/**
 * Defaults — override in wp-config.php or via Settings → CMS Guard.
 */
function teenpatti_cms_guard_defaults(): array {
    return [
        'public_site'       => 'https://teenpattiapks.com.pk',
        'revalidate_url'    => 'https://teenpattiapks.com.pk/api/revalidate',
        'revalidate_secret' => '',
        'enable_redirect'   => 1,
        'enable_noindex'    => 1,
        'enable_robots'     => 1,
    ];
}

function teenpatti_cms_guard_options(): array {
    $saved = get_option('teenpatti_cms_guard', []);
    if (!is_array($saved)) {
        $saved = [];
    }
    return array_merge(teenpatti_cms_guard_defaults(), $saved);
}

function teenpatti_cms_guard_public_site(): string {
    if (defined('TEENPATTI_PUBLIC_SITE') && TEENPATTI_PUBLIC_SITE) {
        return rtrim((string) TEENPATTI_PUBLIC_SITE, '/');
    }
    $opts = teenpatti_cms_guard_options();
    return rtrim((string) $opts['public_site'], '/');
}

/** Front-end HTML on the CMS host (not admin / REST / AJAX / cron). */
function teenpatti_cms_guard_is_public_request(): bool {
    if (is_admin() || wp_doing_ajax() || wp_doing_cron()) {
        return false;
    }
    if (defined('REST_REQUEST') && REST_REQUEST) {
        return false;
    }
    if (defined('XMLRPC_REQUEST') && XMLRPC_REQUEST) {
        return false;
    }
    return true;
}

// ─── 1. Rank Math fields on REST (for Next.js SEO) ─────────────────────────

add_action('rest_api_init', function () {
    register_rest_field('post', 'rank_math', [
        'get_callback' => function ($post) {
            $id = is_array($post) ? $post['id'] : $post->ID;
            return [
                'title'         => get_post_meta($id, 'rank_math_title', true),
                'description'   => get_post_meta($id, 'rank_math_description', true),
                'focus_keyword' => get_post_meta($id, 'rank_math_focus_keyword', true),
                'rich_snippet'  => get_post_meta($id, 'rank_math_rich_snippet', true),
            ];
        },
        'schema' => [
            'description' => 'Rank Math SEO metadata for headless frontend',
            'type'        => 'object',
        ],
    ]);
});

// ─── 2. CORS for Next.js ───────────────────────────────────────────────────

add_action('rest_api_init', function () {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function ($value) {
        $allowed = [
            'http://localhost:3000',
            teenpatti_cms_guard_public_site(),
            'https://www.teenpattiapks.com.pk',
        ];

        $origin = get_http_origin();
        if ($origin && in_array($origin, $allowed, true)) {
            header('Access-Control-Allow-Origin: ' . $origin);
            header('Access-Control-Allow-Methods: GET, OPTIONS');
            header('Access-Control-Allow-Credentials: true');
        }

        return $value;
    });
}, 15);

// ─── 3. Revalidate Next.js on publish / delete ─────────────────────────────

function teenpatti_cms_guard_revalidate(?string $slug = null): void {
    $opts = teenpatti_cms_guard_options();
    $url = $opts['revalidate_url'];
    $secret = $opts['revalidate_secret'];

    if (defined('TEENPATTI_REVALIDATE_URL') && TEENPATTI_REVALIDATE_URL) {
        $url = TEENPATTI_REVALIDATE_URL;
    }
    if (defined('TEENPATTI_REVALIDATE_SECRET') && TEENPATTI_REVALIDATE_SECRET) {
        $secret = TEENPATTI_REVALIDATE_SECRET;
    }

    if (!$url || !$secret) {
        return;
    }

    $body = $slug ? ['slug' => $slug] : new stdClass();

    wp_remote_post(
        add_query_arg('secret', $secret, $url),
        [
            'timeout' => 5,
            'headers' => ['Content-Type' => 'application/json'],
            'body'    => wp_json_encode($body),
        ]
    );
}

add_action('save_post', function ($post_id, $post) {
    if (wp_is_post_revision($post_id) || $post->post_status !== 'publish') {
        return;
    }
    if (!in_array($post->post_type, ['post', 'page'], true)) {
        return;
    }
    teenpatti_cms_guard_revalidate($post->post_name);
}, 10, 2);

add_action('deleted_post', function () {
    teenpatti_cms_guard_revalidate(null);
});

// ─── 4. Block CMS indexing + redirect to main site ─────────────────────────

add_action('template_redirect', function () {
    $opts = teenpatti_cms_guard_options();
    if (empty($opts['enable_redirect']) || !teenpatti_cms_guard_is_public_request()) {
        return;
    }

    $uri = isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '/';
    $path = parse_url($uri, PHP_URL_PATH);
    if (!is_string($path) || $path === '') {
        $path = '/';
    }
    if ($path !== '/') {
        $path = rtrim($path, '/');
    }

    wp_redirect(teenpatti_cms_guard_public_site() . $path, 301);
    exit;
}, 0);

add_filter('robots_txt', function ($output, $public) {
    $opts = teenpatti_cms_guard_options();
    if (empty($opts['enable_robots'])) {
        return $output;
    }
    return "User-agent: *\nDisallow: /\n";
}, 999, 2);

add_filter('pre_option_blog_public', function ($value) {
    $opts = teenpatti_cms_guard_options();
    if (empty($opts['enable_noindex'])) {
        return $value;
    }
    return '0';
});

add_action('send_headers', function () {
    $opts = teenpatti_cms_guard_options();
    if (empty($opts['enable_noindex']) || !teenpatti_cms_guard_is_public_request()) {
        return;
    }
    header('X-Robots-Tag: noindex, nofollow', true);
});

add_action('wp_head', function () {
    $opts = teenpatti_cms_guard_options();
    if (empty($opts['enable_noindex'])) {
        return;
    }
    echo '<meta name="robots" content="noindex, nofollow">' . "\n";
}, 0);

add_filter('wp_robots', function ($robots) {
    $opts = teenpatti_cms_guard_options();
    if (empty($opts['enable_noindex'])) {
        return $robots;
    }
    return [
        'noindex'   => true,
        'nofollow'  => true,
        'noarchive' => true,
    ];
}, 999);

add_filter('rank_math/frontend/robots', function ($robots) {
    $opts = teenpatti_cms_guard_options();
    if (empty($opts['enable_noindex'])) {
        return $robots;
    }
    return [
        'index'  => 'noindex',
        'follow' => 'nofollow',
    ];
}, 999);

add_filter('rank_math/frontend/canonical', function ($canonical) {
    $opts = teenpatti_cms_guard_options();
    if (empty($opts['enable_noindex'])) {
        return $canonical;
    }
    return '';
}, 999);

add_filter('rank_math/sitemap/enable', function ($enable) {
    $opts = teenpatti_cms_guard_options();
    if (empty($opts['enable_robots'])) {
        return $enable;
    }
    return false;
});

// ─── 5. Settings page ──────────────────────────────────────────────────────

add_action('admin_menu', function () {
    add_options_page(
        'Teen Patti CMS Guard',
        'CMS Guard',
        'manage_options',
        'teenpatti-cms-guard',
        'teenpatti_cms_guard_render_settings'
    );
});

add_action('admin_init', function () {
    register_setting('teenpatti_cms_guard', 'teenpatti_cms_guard', [
        'type'              => 'array',
        'sanitize_callback' => 'teenpatti_cms_guard_sanitize',
        'default'           => teenpatti_cms_guard_defaults(),
    ]);
});

function teenpatti_cms_guard_sanitize($input): array {
    $defaults = teenpatti_cms_guard_defaults();
    $out = $defaults;

    if (!is_array($input)) {
        return $out;
    }

    $out['public_site'] = esc_url_raw($input['public_site'] ?? $defaults['public_site']);
    $out['revalidate_url'] = esc_url_raw($input['revalidate_url'] ?? $defaults['revalidate_url']);
    $out['revalidate_secret'] = sanitize_text_field($input['revalidate_secret'] ?? '');
    $out['enable_redirect'] = empty($input['enable_redirect']) ? 0 : 1;
    $out['enable_noindex'] = empty($input['enable_noindex']) ? 0 : 1;
    $out['enable_robots'] = empty($input['enable_robots']) ? 0 : 1;

    return $out;
}

function teenpatti_cms_guard_render_settings(): void {
    if (!current_user_can('manage_options')) {
        return;
    }

    $opts = teenpatti_cms_guard_options();
    ?>
    <div class="wrap">
        <h1>Teen Patti CMS Guard</h1>
        <p>
            WordPress on this host is for writing only.
            Public posts are indexed on <strong><?php echo esc_html(teenpatti_cms_guard_public_site()); ?></strong> only.
        </p>
        <form method="post" action="options.php">
            <?php settings_fields('teenpatti_cms_guard'); ?>
            <table class="form-table" role="presentation">
                <tr>
                    <th scope="row"><label for="public_site">Public site URL</label></th>
                    <td>
                        <input name="teenpatti_cms_guard[public_site]" id="public_site" type="url" class="regular-text"
                            value="<?php echo esc_attr($opts['public_site']); ?>" required>
                        <p class="description">Next.js site that should rank in Google.</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="revalidate_url">Revalidate URL</label></th>
                    <td>
                        <input name="teenpatti_cms_guard[revalidate_url]" id="revalidate_url" type="url" class="regular-text"
                            value="<?php echo esc_attr($opts['revalidate_url']); ?>">
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="revalidate_secret">Revalidate secret</label></th>
                    <td>
                        <input name="teenpatti_cms_guard[revalidate_secret]" id="revalidate_secret" type="text" class="regular-text"
                            value="<?php echo esc_attr($opts['revalidate_secret']); ?>" autocomplete="off">
                        <p class="description">Must match <code>REVALIDATE_SECRET</code> in Next.js <code>.env</code>.</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">Protection</th>
                    <td>
                        <label>
                            <input type="checkbox" name="teenpatti_cms_guard[enable_redirect]" value="1"
                                <?php checked(!empty($opts['enable_redirect'])); ?>>
                            301 redirect public CMS pages to the main site
                        </label><br>
                        <label>
                            <input type="checkbox" name="teenpatti_cms_guard[enable_noindex]" value="1"
                                <?php checked(!empty($opts['enable_noindex'])); ?>>
                            Force noindex / nofollow (overrides Rank Math)
                        </label><br>
                        <label>
                            <input type="checkbox" name="teenpatti_cms_guard[enable_robots]" value="1"
                                <?php checked(!empty($opts['enable_robots'])); ?>>
                            robots.txt Disallow all + disable Rank Math sitemap
                        </label>
                    </td>
                </tr>
            </table>
            <?php submit_button('Save settings'); ?>
        </form>
        <hr>
        <h2>After activate — verify</h2>
        <ol>
            <li>Open a post URL on this CMS host — it should <strong>301</strong> to the main site.</li>
            <li>Open <code>/robots.txt</code> — should show <code>Disallow: /</code>.</li>
            <li>Publish still works from <code>/wp-admin</code>; Next.js still reads <code>/wp-json/</code>.</li>
        </ol>
    </div>
    <?php
}

register_activation_hook(__FILE__, function () {
    $current = get_option('teenpatti_cms_guard');
    if (!is_array($current)) {
        $defaults = teenpatti_cms_guard_defaults();
        // Prefill secret from legacy theme constant if present in codebase history.
        $defaults['revalidate_secret'] = 'be22531463ffb475f1db5710bf51a7110e26117b8fb004c0';
        add_option('teenpatti_cms_guard', $defaults);
    }
});
