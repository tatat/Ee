guard 'uglify', :input => 'lib/ee.js', :output => 'lib/ee.min.js' do
  watch('lib/ee.js')
end

guard 'livereload' do
  watch(%r{^(lib|spec)/.+\.((?<!min\.)js|html)$})
end