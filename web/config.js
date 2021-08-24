export default {
  plugins: [
    // DMT provided plugins
    import('@dmt/default-form'),
    import('@dmt/default-pdf'),
    import('@dmt/default-preview'),
    import('@dmt/yaml-view'),
    // Custom plugins
    import('forecast-of-response'),
  ],
}
