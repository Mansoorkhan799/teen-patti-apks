<?php
/**
 * Kadence Child Theme — Teen Patti APKs
 *
 * Theme styles only. Headless CMS + indexing guard live in the plugin:
 * wordpress/plugins/teenpatti-cms-guard/
 */

if (!defined('ABSPATH')) {
    exit;
}

add_action('wp_enqueue_scripts', function () {
    wp_enqueue_style(
        'kadence-parent-style',
        get_template_directory_uri() . '/style.css',
        [],
        wp_get_theme(get_template())->get('Version')
    );
});
